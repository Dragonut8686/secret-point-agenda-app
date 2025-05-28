
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { speaker_id, text } = await req.json();
    
    console.log('Received request:', { speaker_id, text });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const botToken = Deno.env.get('BOT_TOKEN')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Получаем telegram_id спикера
    const { data: speaker, error: speakerError } = await supabase
      .from('speakers')
      .select('telegram_id')
      .eq('id', speaker_id)
      .single();

    if (speakerError || !speaker?.telegram_id) {
      console.error('Speaker not found:', speakerError);
      throw new Error('Speaker not found or no telegram_id');
    }

    console.log('Found speaker with telegram_id:', speaker.telegram_id);

    // Убираем @ если есть
    const chatId = speaker.telegram_id.replace(/^@/, '');

    // Отправляем сообщение в Telegram
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text
      })
    });

    if (!telegramResponse.ok) {
      const errorText = await telegramResponse.text();
      console.error('Telegram API error:', errorText);
      throw new Error(`Telegram API error ${telegramResponse.status}: ${errorText}`);
    }

    console.log('Message sent successfully');

    return new Response(
      JSON.stringify({ status: 'ok' }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    console.error('Error in notify_speaker function:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
