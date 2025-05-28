import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Heart } from 'lucide-react';
import { getTelegramId } from '@/utils/getTelegramId';

interface Work {
  id: string;
  title: string;
  description: string | null;
  author_name: string | null;
  photo_url: string | null;
  votes_count: number;
}

const VotePage = () => {
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const telegram_id = getTelegramId();

  // 1) Получаем список работ
  const { data: works, isLoading: isWorksLoading, error: worksError } = useQuery<Work[]>({
    queryKey: ['works', EVENT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('event_id', EVENT_ID)
        .order('id', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // 2) Получаем уже отданные голоса
  const { data: votes, isLoading: isVotesLoading, error: votesError } = useQuery<string[]>({
    queryKey: ['votes', EVENT_ID, telegram_id],
    enabled: !!telegram_id,
    queryFn: async () => {
      if (!telegram_id) throw new Error('Telegram ID не найден');
      const { data, error } = await supabase
        .from('votes')
        .select('work_id')
        .eq('event_id', EVENT_ID)
        .eq('telegram_id', telegram_id);
      if (error) throw error;
      return data.map(v => v.work_id);
    }
  });

  useEffect(() => {
    if (votes) setUserVotes(new Set(votes));
  }, [votes]);

  // 3) Мутация для голосования/отмены
  const voteMutation = useMutation<
    { workId: string; action: 'added' | 'removed' },
    Error,
    string
  >({
    mutationFn: async workId => {
      if (!telegram_id) throw new Error('Telegram ID не найден');
      const work = works?.find(w => w.id === workId);
      if (!work) throw new Error('Work not found');

      if (userVotes.has(workId)) {
        // удалить голос
        let { error } = await supabase
          .from('votes')
          .delete()
          .eq('event_id', EVENT_ID)
          .eq('work_id', workId)
          .eq('telegram_id', telegram_id);
        if (error) throw error;

        // уменьшить счётчик
        ({ error } = await supabase
          .from('works')
          .update({ votes_count: work.votes_count - 1 })
          .eq('id', workId));
        if (error) throw error;

        return { workId, action: 'removed' };
      } else {
        // добавить голос
        let { error } = await supabase
          .from('votes')
          .insert({ event_id: EVENT_ID, work_id: workId, telegram_id });
        if (error) throw error;

        // увеличить счётчик
        ({ error } = await supabase
          .from('works')
          .update({ votes_count: work.votes_count + 1 })
          .eq('id', workId));
        if (error) throw error;

        return { workId, action: 'added' };
      }
    },
    onSuccess: ({ workId, action }) => {
      // обновить локальный Set
      setUserVotes(prev => {
        const updated = new Set(prev);
        action === 'added' ? updated.add(workId) : updated.delete(workId);
        return updated;
      });
      // правильно инвалидируем кэши:
queryClient.invalidateQueries({ queryKey: ['works', EVENT_ID], refetchType: 'all' });
queryClient.invalidateQueries({ queryKey: ['votes', EVENT_ID, telegram_id], refetchType: 'all' });
      toast({
        title: action === 'added' ? 'Голос учтён!' : 'Голос удалён',
        description: action === 'added' ? 'Спасибо!' : 'Голос отменён',
      });
    },
    onError: error => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  });

  const handleVote = (workId: string) => voteMutation.mutate(workId);

  // 4) Шапка состояний
  if (!telegram_id) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500 mb-4">Telegram ID не найден</p>
        <p className="text-gray-600">Откройте приложение через Telegram</p>
      </div>
    );
  }
  if (isWorksLoading || isVotesLoading) return <div className="text-center p-6">Загрузка...</div>;
  if (worksError || votesError) return <div className="text-center p-6 text-red-500">Ошибка загрузки</div>;
  if (!works || works.length === 0) return <div className="text-center p-6">Нет работ</div>;

  // 5) Рендер карточек
  return (
    <motion.div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">Конкурс</h1>
        <div className="grid gap-6 md:grid-cols-2">
          {works.map(work => {
            const hasVoted = userVotes.has(work.id);
            return (
              <motion.div
                key={work.id}
                className="bg-white rounded-xl shadow-sm p-4 flex flex-col"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {work.photo_url ? (
                  <img
                    src={work.photo_url}
                    alt={work.title}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
                <h3 className="text-lg font-bold mb-1">{work.title}</h3>
                {work.author_name && <p className="text-sm text-gray-600 mb-2">Автор: {work.author_name}</p>}
                {work.description && <p className="text-sm text-gray-500 mb-4">{work.description}</p>}
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center text-[var(--app-primary)]">
                    <Heart className="w-5 h-5 mr-1" />
                    <span>{work.votes_count}</span>
                  </div>
                  <Button
                    onClick={() => handleVote(work.id)}
                    disabled={voteMutation.isPending}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    {hasVoted ? 'Отменить' : 'Голосовать'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default VotePage;
