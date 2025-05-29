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
    // 2) Парсим JSON от Telegram
    const update = await req.json()
    const message = update.message

    // 3) Игнорируем всё, что не /start
    if (!message || message.text !== '/start') {
      return new Response(
        JSON.stringify({ status: 'ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4) Достаём данные пользователя
    const from = message.from
    const telegram_id = from.id
    const username = from.username || null
    const full_name = [from.first_name, from.last_name]
      .filter(Boolean)
      .join(' ') || null

    // 5) Инициализируем Supabase Client с Service Role Key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 6) Вставляем или обновляем запись в participants
    const { error } = await supabase
      .from('participants')
      .upsert(
        { telegram_id, username, full_name },
        { onConflict: 'telegram_id' }
      )

    if (error) {
      console.error('Error inserting participant:', error)
      throw new Error(error.message)
    }

    // 7) Возвращаем успешный ответ Telegram
    return new Response(
      JSON.stringify({ status: 'ok', telegram_id }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (err: any) {
    console.error('Error in register_user function:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
