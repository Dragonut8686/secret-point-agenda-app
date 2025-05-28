
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle } from 'lucide-react';

interface Speaker {
  id: string;
  name: string;
  telegram_id: string | null;
}

const QuestionsPage = () => {
  const [questionText, setQuestionText] = useState('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Выбираем спикеров вместе с их telegram_id
  const { data: speakers, isLoading } = useQuery({
    queryKey: ['speakers', EVENT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('speakers')
        .select('id, name, telegram_id')
        .eq('event_id', EVENT_ID);

      if (error) throw error;
      return data as Speaker[];
    },
  });

  const submitQuestion = async () => {
    if (!questionText.trim()) {
      toast({ title: "Ошибка", description: "Введите текст вопроса", variant: "destructive" });
      return;
    }
    if (!selectedSpeakerId) {
      toast({ title: "Ошибка", description: "Выберите спикера", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Сохраняем вопрос в базе данных
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

      // Вызываем серверную функцию для уведомления спикера
      await supabase
        .functions
        .invoke('notify_speaker', {
          body: JSON.stringify({
            speaker_id: selectedSpeakerId,
            text: `У вас новый вопрос:\n\n${questionText.trim()}`
          })
        });

      toast({ title: "Успешно!", description: "Вопрос отправлен!" });

      // Сброс полей
      setQuestionText('');
      setSelectedSpeakerId('');
      setIsAnonymous(false);
    } catch (err: any) {
      console.error(err);
      toast({ title: "Ошибка", description: "Не удалось отправить вопрос", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div className="min-h-screen p-4" initial={{ opacity:0 }} animate={{ opacity:1 }}>
        <div className="max-w-screen-sm mx-auto text-center">Загрузка спикеров...</div>
      </motion.div>
    );
  }

  return (
    <motion.div className="min-h-screen p-4" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
      <div className="max-w-screen-sm mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Вопросы</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center mb-4">
            <MessageCircle className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
            <h2 className="text-lg font-semibold">Задать вопрос</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Спикер</label>
            <Select value={selectedSpeakerId} onValueChange={setSelectedSpeakerId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Выберите спикера" /></SelectTrigger>
              <SelectContent>
                {speakers?.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Вопрос</label>
            <Textarea
              placeholder="Введите ваш вопрос..."
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={c => setIsAnonymous(c === true)}
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Задать анонимно
            </label>
          </div>

          <Button onClick={submitQuestion} disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuestionsPage;
