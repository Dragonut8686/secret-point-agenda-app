import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, User } from 'lucide-react';

const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

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

  // 1) Загружаем спикеров
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

  // 2) Отправка вопроса
  const submitQuestion = async () => {
    if (!questionText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст вопроса',
        variant: 'destructive',
      });
      return;
    }
    if (!selectedSpeakerId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите спикера',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // приводим user.id (number) к строке
      const telegramIdStr = user?.id ? String(user.id) : null;
      const authorName =
        !isAnonymous && user
          ? `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim()
          : null;
      const authorUsername = !isAnonymous ? user?.username ?? null : null;

      // 2.1) Вставляем в questions все поля и получаем question_id
      const { data: insertedQuestion, error: insertError } = await supabase
        .from('questions')
        .insert({
          event_id: EVENT_ID,
          speaker_id: selectedSpeakerId,
          text: questionText.trim(),
          author_telegram_id: telegramIdStr,
          author_name: authorName,
          author_username: authorUsername,
          is_anonymous: isAnonymous,
        })
        .select('id')
        .single();
      
      if (insertError) throw insertError;

      // 2.2) Уведомляем спикера с question_id (используем новую функцию)
      await supabase.functions.invoke('notify_speaker_secretpoint', {
        body: JSON.stringify({
          speaker_id: selectedSpeakerId,
          text: questionText.trim(),
          asker_name: authorName,
          asker_username: authorUsername,
          is_anonymous: isAnonymous,
          timestamp: new Date().toISOString(),
          question_id: insertedQuestion.id,
        }),
      });

      toast({ title: 'Успешно!', description: 'Вопрос отправлен!' });
      setQuestionText('');
      setSelectedSpeakerId('');
      setIsAnonymous(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить вопрос',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-[var(--app-bg)] to-slate-900 p-4 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-primary)] mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка спикеров...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[var(--app-bg)] to-slate-900 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-lg mx-auto pt-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[var(--app-primary)] to-purple-600 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Задать вопрос</h1>
          <p className="text-gray-400">Отправьте вопрос спикеру и получите ответ</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="space-y-4">
            {/* Speaker Selection */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--app-primary)]" />
                Выберите спикера
              </label>
              <Select
                value={selectedSpeakerId}
                onValueChange={setSelectedSpeakerId}
              >
                <SelectTrigger className="w-full bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-[var(--app-primary)] focus:ring-[var(--app-primary)]/20 rounded-xl h-11">
                  <SelectValue placeholder="Выберите спикера из списка" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 max-w-[calc(100vw-2rem)] z-50">
                  {speakers?.map((speaker) => (
                    <SelectItem
                      key={speaker.id}
                      value={speaker.id}
                      className="text-white hover:bg-slate-700 focus:bg-slate-700"
                    >
                      {speaker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[var(--app-primary)]" />
                Ваш вопрос
              </label>
              <Textarea
                placeholder="Опишите ваш вопрос подробно..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="min-h-[80px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-[var(--app-primary)] focus:ring-[var(--app-primary)]/20 rounded-xl resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-400 text-right">
                {questionText.length}/500
              </div>
            </div>

            {/* Anonymous Option */}
            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(c) => setIsAnonymous(c === true)}
                className="border-white/30 data-[state=checked]:bg-[var(--app-primary)] data-[state=checked]:border-[var(--app-primary)]"
              />
              <label htmlFor="anonymous" className="text-sm text-gray-200 flex-1 cursor-pointer">
                Задать вопрос анонимно
              </label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={submitQuestion}
              disabled={
                isSubmitting || !questionText.trim() || !selectedSpeakerId
              }
              className="w-full bg-gradient-to-r from-[var(--app-primary)] to-purple-600 hover:from-[var(--app-primary)]/90 hover:to-purple-600/90 text-white font-semibold h-11 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Отправка...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Отправить вопрос
                </div>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-blue-200 text-center">
            💡 Ваш вопрос будет отправлен спикеру в Telegram и появится в общем списке вопросов
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default QuestionsPage;
