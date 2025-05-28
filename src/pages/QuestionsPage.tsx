import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, BOT_TOKEN } from '@/config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle } from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  telegram_id: string | null;
}

const QuestionsPage = () => {
  const [questionText, setQuestionText] = useState('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: speakers, isLoading } = useQuery<Speaker[]>({
    queryKey: ['speakers', EVENT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .eq('event_id', EVENT_ID);

      if (error) throw error;
      return data;
    },
  });

  const submitQuestion = async () => {
    if (!questionText.trim()) {
      return toast({
        title: "Ошибка",
        description: "Введите текст вопроса",
        variant: "destructive",
      });
    }
    if (!selectedSpeakerId) {
      return toast({
        title: "Ошибка",
        description: "Выберите спикера",
        variant: "destructive",
      });
    }

    setIsSubmitting(true);

    try {
      // 1) вставляем вопрос
      const { error: insertError } = await supabase
        .from('questions')
        .insert({
          event_id: EVENT_ID,
          speaker_id: selectedSpeakerId,
          text: questionText.trim(),
          author_telegram_id: null,
          is_anonymous: isAnonymous,
        });

      if (insertError) throw insertError;

      // 2) получаем telegram_id спикера
      const { data: spData, error: spError } = await supabase
        .from('speakers')
        .select('telegram_id')
        .eq('id', selectedSpeakerId)
        .single();

      if (!spError && spData?.telegram_id) {
        const chatId = spData.telegram_id.replace(/^@/, '');
        // 3) шлём уведомление
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `📩 *Новый вопрос*\n${ questionText.trim() }`,
            parse_mode: 'Markdown'
          }),
        }).catch(console.error);
      }

      toast({
        title: "Успешно!",
        description: "Вопрос отправлен!",
      });
      setQuestionText('');
      setSelectedSpeakerId('');
      setIsAnonymous(false);

    } catch (err: any) {
      console.error(err);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить вопрос",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div className="min-h-screen p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="max-w-screen-sm mx-auto text-center">
          <h1 className="text-2xl font-bold mb-6">Вопросы</h1>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div className="min-h-screen p-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="max-w-screen-sm mx-auto">
        <motion.h1 className="text-2xl font-bold text-center mb-6">Вопросы</motion.h1>
        <motion.div
          className="bg-white rounded-xl shadow-sm p-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center mb-4">
            <MessageCircle className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
            <h2 className="text-lg font-semibold">Задать вопрос</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Спикер</label>
            <Select value={selectedSpeakerId} onValueChange={setSelectedSpeakerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите спикера" />
              </SelectTrigger>
              <SelectContent>
                {speakers?.map((sp) => (
                  <SelectItem key={sp.id} value={sp.id}>
                    {sp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Вопрос</label>
            <Textarea
              placeholder="Введите ваш вопрос..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(c) => setIsAnonymous(c === true)}
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">Задать анонимно</label>
          </div>

          <Button
            onClick={submitQuestion}
            disabled={isSubmitting}
            className="w-full bg-[var(--app-primary)] hover:bg-[var(--app-primary)]/80 text-white"
          >
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuestionsPage;
