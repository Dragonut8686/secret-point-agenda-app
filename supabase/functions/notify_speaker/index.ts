
// supabase/functions/notify_speaker/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 1) Распакуем все поля
    const {
      speaker_id,
      text,
      asker_name,
      asker_username,
      is_anonymous,
      timestamp,
      question_id,
    } = await req.json()

    // 2) Подключимся к Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const botToken = Deno.env.get('BOT_TOKEN')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 3) Получим telegram_id и имя спикера
    const { data: speaker, error: speakerError } = await supabase
      .from('speakers')
      .select('telegram_id, name')
      .eq('id', speaker_id)
      .single()
    if (speakerError || !speaker) {
      console.error('Speaker lookup failed:', speakerError)
      throw new Error('Не удалось найти спикера')
    }

    // Обработка chat_id
    let chatId = speaker.telegram_id!.toString().trim()
    if (chatId.startsWith('@')) chatId = chatId.slice(1)

    // 4) Формируем структурированное сообщение
    const lineTo = `📨 <b>Новый вопрос спикеру:</b> <i>${escapeHtml(speaker.name)}</i>`
    const lineFrom = is_anonymous
      ? '🤫 <b>От:</b> Аноним'
      : `🙋 <b>От:</b> ${escapeHtml(asker_name)}${asker_username ? ` (<code>@${escapeHtml(asker_username)}</code>)` : ''}`

    // Форматируем дату/время в Europe/Moscow
    const dt = new Date(timestamp)
    const date = dt.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })
    const time = dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' })
    const lineWhen = `🕒 <b>Когда:</b> ${date} ${time}`

    const lineText = `💬 <b>Вопрос:</b>\n${escapeHtml(text)}`

    const html = [lineTo, lineFrom, lineWhen, lineText].join('\n\n')

    // 5) Формируем inline-клавиатуру
    const replyMarkup = {
      inline_keyboard: [
        [
          {
            text: "Ответить",
            callback_data: `answer:${question_id}`
          }
        ]
      ]
    }

    // 6) Шлём в Telegram
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: html,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: replyMarkup,
      }),
    })
    const result = await response.json()
    if (!response.ok) {
      console.error('Telegram API error:', result)
      throw new Error(result.description || 'Ошибка Telegram API')
    }

    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('notify_speaker error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// Экранируем HTML-тэги, чтобы в тексте не было уязвимостей
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
