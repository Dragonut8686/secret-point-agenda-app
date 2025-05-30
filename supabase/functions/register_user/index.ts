
// supabase/functions/register_user/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1) CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const update = await req.json()
    
    // 2) Инициализируем Supabase Client с Service Role Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const botToken = Deno.env.get('BOT_TOKEN')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 3) Обработка callback_query (нажатие кнопки "Ответить")
    if (update.callback_query) {
      const callbackQuery = update.callback_query
      const data = callbackQuery.data
      const from = callbackQuery.from
      const telegram_id = from.id

      if (data && data.startsWith('answer:')) {
        const questionId = data.split(':')[1]
        
        // Обновляем pending_question_id для спикера
        const { error: updateError } = await supabase
          .from('participants')
          .upsert(
            { 
              telegram_id: telegram_id.toString(), 
              pending_question_id: questionId 
            },
            { onConflict: 'telegram_id' }
          )
        
        if (updateError) {
          console.error('Error updating participant:', updateError)
        }

        // Отправляем сообщение спикеру
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegram_id,
            text: '📝 Напишите свой ответ в одном сообщении.',
            parse_mode: 'HTML',
          }),
        })

        // Подтверждаем callback
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: 'Напишите ваш ответ в следующем сообщении',
          }),
        })

        return new Response(
          JSON.stringify({ status: 'callback_processed' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 4) Обработка текстовых сообщений (ответы спикеров)
    if (update.message && update.message.text) {
      const message = update.message
      const from = message.from
      const telegram_id = from.id.toString()
      const answerText = message.text

      // Проверяем, есть ли pending_question_id для этого пользователя
      const { data: participant } = await supabase
        .from('participants')
        .select('pending_question_id')
        .eq('telegram_id', telegram_id)
        .maybeSingle()

      if (participant && participant.pending_question_id) {
        const questionId = participant.pending_question_id

        // Получаем данные вопроса и спикера
        const { data: questionData } = await supabase
          .from('questions')
          .select(`
            id,
            text,
            author_telegram_id,
            speakers!inner(name)
          `)
          .eq('id', questionId)
          .single()

        if (questionData) {
          // Обновляем вопрос с ответом
          await supabase
            .from('questions')
            .update({
              answer_text: answerText,
              answered_at: new Date().toISOString(),
              is_answered: true
            })
            .eq('id', questionId)

          // Очищаем pending_question_id
          await supabase
            .from('participants')
            .update({ pending_question_id: null })
            .eq('telegram_id', telegram_id)

          // Отправляем уведомление автору вопроса
          if (questionData.author_telegram_id) {
            const speakerName = questionData.speakers.name
            const questionText = questionData.text
            
            // Форматируем время ответа
            const now = new Date()
            const date = now.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })
            const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' })

            const responseMessage = [
              `✉️ <b>Ответ на ваш вопрос:</b> <i>${escapeHtml(questionText)}</i>`,
              ``,
              `👤 <b>От:</b> ${escapeHtml(speakerName)}`,
              `🕒 <b>Время:</b> ${date} ${time}`,
              `📩 <b>Ответ:</b> ${escapeHtml(answerText)}`
            ].join('\n')

            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: questionData.author_telegram_id,
                text: responseMessage,
                parse_mode: 'HTML',
              }),
            })
          }

          // Подтверждаем спикеру
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: telegram_id,
              text: '✅ Ваш ответ отправлен автору вопроса!',
              parse_mode: 'HTML',
            }),
          })

          return new Response(
            JSON.stringify({ status: 'answer_processed' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // 5) Обработка команды /start (регистрация пользователя)
    const message = update.message
    if (!message || message.text !== '/start') {
      return new Response(
        JSON.stringify({ status: 'ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 6) Достаём данные пользователя
    const from = message.from!
    const telegram_id = from.id
    const username = from.username || null
    const full_name = [from.first_name, from.last_name]
      .filter(Boolean)
      .join(' ') || null

    // 7) Вписываем или обновляем участника
    const { error: upsertError } = await supabase
      .from('participants')
      .upsert(
        { telegram_id: telegram_id.toString(), username, full_name },
        { onConflict: 'telegram_id' }
      )
    if (upsertError) throw upsertError

    // 8) Отправляем приветственное сообщение
    const welcomeText = [
      `👋 Привет, ${full_name ?? 'друг'}!`,
      ``,
      `Это бот конференции SecretPointConf2025.`,
      `Нажмите на кнопку «Меню мероприятия» внизу, чтобы получить расписание, проголосовать за доклады или задать вопрос спикеру.`,
      ``,
      `Если что-то не понятно — пишите сюда в чат, я помогу!`
    ].join('\n')

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegram_id,
        text: welcomeText,
        parse_mode: 'HTML',
      }),
    })

    // 9) Завершаем с успехом
    return new Response(
      JSON.stringify({ status: 'ok', telegram_id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('Error in register_user function:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// Экранируем HTML-тэги
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
