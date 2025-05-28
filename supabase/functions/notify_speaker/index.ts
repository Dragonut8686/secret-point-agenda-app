
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
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      hasBotToken: !!botToken
    });
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Получаем telegram_id спикера
    const { data: speaker, error: speakerError } = await supabase
      .from('speakers')
      .select('telegram_id, name')
      .eq('id', speaker_id)
      .single();

    if (speakerError) {
      console.error('Speaker query error:', speakerError);
      throw new Error(`Speaker query failed: ${speakerError.message}`);
    }

    if (!speaker?.telegram_id) {
      console.error('Speaker not found or no telegram_id:', speaker);
      throw new Error('Speaker not found or no telegram_id');
    }

    console.log('Found speaker:', { name: speaker.name, telegram_id: speaker.telegram_id });

    // Обработка telegram_id - убираем @ если есть
    let chatId = speaker.telegram_id.toString().trim();
    if (chatId.startsWith('@')) {
      chatId = chatId.substring(1);
    }

    console.log('Processed chat_id:', chatId);

    // Сначала попробуем получить информацию о чате
    const getChatResponse = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId
      })
    });

    const getChatResult = await getChatResponse.json();
    console.log('getChat result:', getChatResult);

    if (!getChatResponse.ok) {
      console.error('getChat failed:', getChatResult);
      
      // Попробуем с @ в начале
      const chatIdWithAt = '@' + chatId;
      console.log('Trying with @:', chatIdWithAt);
      
      const getChatResponse2 = await fetch(`https://api.telegram.org/bot${botToken}/getChat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatIdWithAt
        })
      });

      const getChatResult2 = await getChatResponse2.json();
      console.log('getChat with @ result:', getChatResult2);
      
      if (getChatResponse2.ok) {
        chatId = chatIdWithAt;
      } else {
        throw new Error(`Cannot find chat for user. Tried: "${chatId}" and "${chatIdWithAt}". Error: ${getChatResult.description || 'Unknown error'}`);
      }
    }

    // Отправляем сообщение в Telegram
    console.log('Sending message to chat_id:', chatId);
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const telegramResult = await telegramResponse.json();
    console.log('sendMessage result:', telegramResult);

    if (!telegramResponse.ok) {
      console.error('Telegram sendMessage error:', telegramResult);
      throw new Error(`Telegram API error ${telegramResponse.status}: ${telegramResult.description || 'Unknown error'}`);
    }

    console.log('Message sent successfully to:', chatId);

    return new Response(
      JSON.stringify({ 
        status: 'ok',
        chat_id: chatId,
        message_id: telegramResult.result?.message_id 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (err: any) {
    console.error('Error in notify_speaker function:', err);
    return new Response(
      JSON.stringify({ 
        error: err.message,
        details: err.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
