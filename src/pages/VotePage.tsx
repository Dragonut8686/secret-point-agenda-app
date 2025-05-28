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
  const telegram_id = getTelegramId();
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 1) Получаем работы
  const { data: works, isLoading: loadingWorks } = useQuery<Work[]>({
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

  // 2) Получаем голоса текущего пользователя
  useQuery<string[]>({
    queryKey: ['votes', EVENT_ID, telegram_id],
    enabled: Boolean(telegram_id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('work_id')
        .eq('event_id', EVENT_ID)
        .eq('telegram_id', telegram_id);
      if (error) throw error;
      return data.map(v => v.work_id);
    },
    onSuccess: (ids) => setUserVotes(new Set(ids)),
  });

  // 3) Мутация голосования/отмены
  const { mutate: toggleVote, isLoading: toggling } = useMutation<
    void,
    Error,
    string
  >({
    mutationFn: async (workId) => {
      if (!telegram_id) throw new Error('Откройте через Telegram');
      const has = userVotes.has(workId);

      // Удаляем/добавляем запись в votes
      if (has) {
        await supabase
          .from('votes')
          .delete()
          .eq('event_id', EVENT_ID)
          .eq('work_id', workId)
          .eq('telegram_id', telegram_id);
      } else {
        await supabase
          .from('votes')
          .insert({ event_id: EVENT_ID, work_id: workId, telegram_id });
      }

      // Обновляем счётчик в works
      const work = works?.find(w => w.id === workId);
      const delta = has ? -1 : 1;
      await supabase
        .from('works')
        .update({ votes_count: (work?.votes_count || 0) + delta })
        .eq('id', workId);
    },
    onSuccess: (_, workId) => {
      setUserVotes(prev => {
        const copy = new Set(prev);
        userVotes.has(workId) ? copy.delete(workId) : copy.add(workId);
        return copy;
      });
      queryClient.invalidateQueries(['works', EVENT_ID]);
      queryClient.invalidateQueries(['votes', EVENT_ID, telegram_id]);
      toast({
        title: 'Ок',
        description: userVotes.has(workId)
          ? 'Голос удалён'
          : 'Голос учтён',
      });
    },
    onError: (err) => {
      toast({ title: 'Ошибка', description: err.message, variant: 'destructive' });
    },
  });

  if (!telegram_id) {
    return <div className="p-6 text-center text-red-500">Откройте приложение через Telegram</div>;
  }
  if (loadingWorks) {
    return <div className="p-6 text-center">Загрузка…</div>;
  }
  if (!works || works.length === 0) {
    return <div className="p-6 text-center">Нет работ для голосования</div>;
  }

  return (
    <motion.div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Конкурс</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {works.map(work => {
          const has = userVotes.has(work.id);
          return (
            <motion.div 
              key={work.id} 
              className="bg-white rounded-xl shadow p-4 flex flex-col"
            >
              {work.photo_url && (
                <img src={work.photo_url} alt="" className="w-full h-48 object-cover rounded mb-4" />
              )}
              <h3 className="font-bold mb-1">{work.title}</h3>
              {work.author_name && <p className="text-sm mb-2">Автор: {work.author_name}</p>}
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center text-lg text-[var(--app-primary)]">
                  <Heart className="mr-1" /> {work.votes_count}
                </div>
                <Button
                  onClick={() => toggleVote(work.id)}
                  disabled={toggling}
                  variant={has ? 'secondary' : 'default'}
                >
                  <Trophy className="mr-2" />
                  {has ? 'Отменить' : 'Голосовать'}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default VotePage;
