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
    const message = update.message

    // 2) Игнорируем всё, что не /start
    if (!message || message.text !== '/start') {
      return new Response(
        JSON.stringify({ status: 'ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3) Достаём данные пользователя
    const from = message.from!
    const telegram_id = from.id
    const username = from.username || null
    const full_name = [from.first_name, from.last_name]
      .filter(Boolean)
      .join(' ') || null

    // 4) Инициализируем Supabase Client с Service Role Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const botToken = Deno.env.get('BOT_TOKEN')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 5) Вписываем или обновляем участника
    const { error: upsertError } = await supabase
      .from('participants')
      .upsert(
        { telegram_id, username, full_name },
        { onConflict: 'telegram_id' }
      )
    if (upsertError) throw upsertError

    // 6) Отправляем приветственное сообщение
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

    // 7) Завершаем с успехом
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
