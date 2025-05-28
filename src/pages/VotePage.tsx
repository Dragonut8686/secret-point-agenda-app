import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Heart } from 'lucide-react';

interface Work {
  id: string;
  title: string;
  description: string | null;
  author_name: string | null;
  photo_url: string | null;
  video_url: string | null;
  votes_count: number;
}

const VotePage = () => {
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // Telegram ID текущего юзера из WebApp
  const telegram_id = window.Telegram?.WebApp?.initDataUnsafe?.user?.id?.toString();

  // 1) Получаем список работ вместе с текущим votes_count
  const { data: works, isLoading: isWorksLoading, error: worksError } = useQuery<Work[]>({
    queryKey: ['works', EVENT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('event_id', EVENT_ID)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // 2) Получаем, за какие работы уже голосовал текущий пользователь
  const { data: votes, isLoading: isVotesLoading, error: votesError } = useQuery<string[]>({
    queryKey: ['votes', EVENT_ID, telegram_id],
    enabled: !!telegram_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('work_id')
        .eq('event_id', EVENT_ID)
        .eq('telegram_id', telegram_id);
      if (error) throw error;
      return data.map(v => v.work_id);
    },
    onSuccess: (votedIds) => {
      setUserVotes(new Set(votedIds));
    }
  });

  // 3) Мутация для голосования/отмены голоса
  const voteMutation = useMutation<
    { workId: string; action: 'added' | 'removed' },
    Error,
    string
  >({
    mutationFn: async (workId: string) => {
      if (!telegram_id) throw new Error('Telegram ID not found');
      // Найдём объект работы, чтобы знать текущий votes_count
      const work = works?.find(w => w.id === workId);
      if (!work) throw new Error('Work not found');

      if (userVotes.has(workId)) {
        // Удаляем голос
        let { error } = await supabase
          .from('votes')
          .delete()
          .eq('event_id', EVENT_ID)
          .eq('work_id', workId)
          .eq('telegram_id', telegram_id);
        if (error) throw error;

        // Декрементируем счётчик
        ({ error } = await supabase
          .from('works')
          .update({ votes_count: work.votes_count - 1 })
          .eq('id', workId));
        if (error) throw error;

        return { workId, action: 'removed' };
      } else {
        // Добавляем голос
        let { error } = await supabase
          .from('votes')
          .insert({ event_id: EVENT_ID, work_id: workId, telegram_id });
        if (error) throw error;

        // Инкрементируем счётчик
        ({ error } = await supabase
          .from('works')
          .update({ votes_count: work.votes_count + 1 })
          .eq('id', workId));
        if (error) throw error;

        return { workId, action: 'added' };
      }
    },
    onSuccess: ({ workId, action }) => {
      // Обновим локальный Set голосов
      setUserVotes(prev => {
        const updated = new Set(prev);
        action === 'added' ? updated.add(workId) : updated.delete(workId);
        return updated;
      });
      // Инвалидируем данные по работам (чтобы обновился votes_count)
      queryClient.invalidateQueries({ queryKey: ['works', EVENT_ID] });
      // Инвалидируем данные по голосам (необязательно, но логично)
      queryClient.invalidateQueries({ queryKey: ['votes', EVENT_ID, telegram_id] });
      // Тост
      toast({
        title: action === 'added' ? 'Голос учтён!' : 'Голос удалён',
        description: action === 'added'
          ? 'Спасибо за участие в голосовании'
          : 'Ваш голос успешно отменён',
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: 'Ошибка',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleVote = (workId: string) => {
    voteMutation.mutate(workId);
  };

  // 4) Общие состояния загрузки / ошибки
  if (isWorksLoading || isVotesLoading) {
    return <div className="text-center p-6">Загрузка...</div>;
  }
  if (worksError || votesError) {
    return <div className="text-center p-6 text-red-500">Ошибка загрузки данных</div>;
  }
  if (!works || works.length === 0) {
    return <div className="text-center p-6">Нет работ для голосования</div>;
  }

  // 5) Рендер
  return (
    <motion.div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <motion.h1 className="text-2xl font-bold text-center mb-6">
          Конкурс
        </motion.h1>
        <motion.div
          className="grid gap-6 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {works.map((work, idx) => {
            const hasVoted = userVotes.has(work.id);
            return (
              <motion.div
                key={work.id}
                className="bg-white text-black rounded-xl shadow-sm p-4 flex flex-col"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {work.photo_url && (
                  <img
                    src={work.photo_url}
                    alt={work.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="text-lg font-bold mb-1">{work.title}</h3>
                {work.author_name && (
                  <p className="text-sm text-gray-600 mb-2">
                    Автор: {work.author_name}
                  </p>
                )}
                {work.description && (
                  <p className="text-sm text-gray-500 mb-4">
                    {work.description}
                  </p>
                )}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-lg text-[var(--app-primary)]">
                      <Heart className="w-5 h-5 mr-1" />
                      <span>{work.votes_count}</span>
                    </div>
                    <Button
                      onClick={() => handleVote(work.id)}
                      disabled={voteMutation.isPending}
                      variant={hasVoted ? 'secondary' : 'default'}
                      className="flex items-center"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      {hasVoted ? 'Отменить голос' : 'Голосовать'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VotePage;
