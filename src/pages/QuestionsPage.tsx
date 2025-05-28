
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast'; // Using shadcn toast
import { Database } from '@/integrations/supabase/types';

type Speaker = Database['public']['Tables']['speakers']['Row'];

const fetchSpeakers = async () => {
  const { data, error } = await supabase
    .from('speakers')
    .select('id, name')
    .eq('event_id', EVENT_ID);

  if (error) throw new Error(error.message);
  return data as Pick<Speaker, 'id' | 'name'>[];
};

const submitQuestion = async (newQuestion: {
  event_id: string;
  speaker_id: string | null;
  text: string;
  is_anonymous: boolean;
  // author_telegram_id will be handled by Telegram integration later
}) => {
  const { data, error } = await supabase.from('questions').insert([newQuestion]).select();
  if (error) throw new Error(error.message);
  return data;
};

const QuestionsPage = () => {
  const queryClient = useQueryClient();
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const { data: speakers, isLoading: isLoadingSpeakers } = useQuery({
    queryKey: ['speakers', EVENT_ID],
    queryFn: fetchSpeakers
  });

  const mutation = useMutation({
    mutationFn: submitQuestion,
    onSuccess: () => {
      toast({ title: "Успех!", description: "Вопрос отправлен!" });
      setSelectedSpeaker('');
      setQuestionText('');
      setIsAnonymous(true);
      queryClient.invalidateQueries({ queryKey: ['questions'] }); // If displaying questions on this page
    },
    onError: (error) => {
      toast({ title: "Ошибка!", description: `Не удалось отправить вопрос: ${error.message}`, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast({ title: "Ошибка!", description: "Пожалуйста, введите текст вопроса.", variant: "destructive" });
      return;
    }
    // For author_telegram_id, you'd typically get this from Telegram's WebApp data
    // const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    // const authorTelegramId = telegramUser ? String(telegramUser.id) : null;

    mutation.mutate({
      event_id: EVENT_ID,
      speaker_id: selectedSpeaker || null,
      text: questionText,
      is_anonymous: isAnonymous,
      // author_telegram_id: authorTelegramId // Add this when Telegram integration is ready
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Задать вопрос</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
        <div>
          <Label htmlFor="speaker-select" className="block mb-2 text-sm font-medium text-gray-300">Спикер (необязательно)</Label>
          <select
            id="speaker-select"
            value={selectedSpeaker}
            onChange={(e) => setSelectedSpeaker(e.target.value)}
            className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)]"
            disabled={isLoadingSpeakers}
          >
            <option value="">Выберите спикера...</option>
            {speakers?.map(speaker => (
              <option key={speaker.id} value={speaker.id}>{speaker.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="question-text" className="block mb-2 text-sm font-medium text-gray-300">Ваш вопрос</Label>
          <Textarea
            id="question-text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Напишите свой вопрос здесь..."
            className="min-h-[100px] bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-[var(--app-primary)] focus:border-[var(--app-primary)]"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="anonymous-check"
            checked={isAnonymous}
            onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
            className="border-gray-600 data-[state=checked]:bg-[var(--app-primary)] data-[state=checked]:border-[var(--app-primary)]"
          />
          <Label htmlFor="anonymous-check" className="text-sm text-gray-300">Задать анонимно</Label>
        </div>
        <Button type="submit" className="w-full bg-[var(--app-primary)] hover:bg-opacity-80 text-white py-2.5" disabled={mutation.isPending}>
          {mutation.isPending ? 'Отправка...' : 'Отправить'}
        </Button>
      </form>
      <p className="text-xs text-center text-gray-500 mt-4">
        Информация о вашем Telegram ID будет добавлена автоматически, если вы не отметите "Задать анонимно".
      </p>
    </div>
  );
};

export default QuestionsPage;
