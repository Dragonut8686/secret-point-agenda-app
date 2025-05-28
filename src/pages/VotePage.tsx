
import React, { useState } from 'react';
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
  const [votedWorks, setVotedWorks] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: works, isLoading, error } = useQuery({
    queryKey: ['works', EVENT_ID],
    queryFn: async () => {
      console.log('Fetching works for EVENT_ID:', EVENT_ID);
      const { data, error } = await supabase
        .from('works')
        .select('*')
        .eq('event_id', EVENT_ID)
        .order('votes_count', { ascending: false });

      if (error) {
        console.error('Error fetching works:', error);
        throw error;
      }

      console.log('Works data received:', data);
      return data as Work[];
    },
  });

  const voteMutation = useMutation({
    mutationFn: async (workId: string) => {
      const work = works?.find(w => w.id === workId);
      if (!work) throw new Error('Work not found');

      const { data, error } = await supabase
        .from('works')
        .update({ 
          votes_count: work.votes_count + 1 
        })
        .eq('id', workId)
        .select()
        .single();

      if (error) {
        console.error('Error voting for work:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data, workId) => {
      setVotedWorks(prev => new Set([...prev, workId]));
      queryClient.invalidateQueries({ queryKey: ['works', EVENT_ID] });
      toast({
        title: "Ваш голос учтён!",
        description: "Спасибо за участие в голосовании",
      });
    },
    onError: (error) => {
      console.error('Error voting:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось проголосовать",
        variant: "destructive",
      });
    },
  });

  const handleVote = (workId: string) => {
    if (votedWorks.has(workId)) {
      toast({
        title: "Вы уже голосовали",
        description: "За эту работу можно голосовать только один раз",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(workId);
  };

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Конкурс</h1>
          <p className="text-center text-gray-500">Загрузка работ...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    console.error('Vote page error:', error);
    return (
      <motion.div 
        className="min-h-screen p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Конкурс</h1>
          <p className="text-center text-red-500">Ошибка загрузки конкурса</p>
        </div>
      </motion.div>
    );
  }

  if (!works || works.length === 0) {
    return (
      <motion.div 
        className="min-h-screen p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Конкурс</h1>
          <p className="text-center text-gray-500">Конкурсные работы пока не загружены</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          className="text-2xl font-bold text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Конкурс
        </motion.h1>
        
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-[var(--app-primary)] mr-2" />
            <p className="text-lg text-gray-700">Голосуйте за лучшие работы</p>
          </div>
        </motion.div>

        <motion.div
          className="grid gap-6 md:grid-cols-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {works.map((work, index) => (
            <motion.div
              key={work.id}
              className="bg-white text-black rounded-xl shadow-sm p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
            >
              {work.photo_url && (
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img 
                    src={work.photo_url} 
                    alt={work.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center text-gray-400">
                          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">{work.title}</h3>
                <div className="flex items-center text-[var(--app-primary)]">
                  <Heart className="w-4 h-4 mr-1" />
                  <span className="font-bold">{work.votes_count}</span>
                </div>
              </div>

              {work.author_name && (
                <p className="text-[var(--app-primary)] font-medium mb-2">
                  Автор: {work.author_name}
                </p>
              )}

              {work.description && (
                <p className="text-gray-600 text-sm mb-4">{work.description}</p>
              )}

              <Button 
                onClick={() => handleVote(work.id)}
                disabled={votedWorks.has(work.id) || voteMutation.isPending}
                className={`w-full ${
                  votedWorks.has(work.id) 
                    ? 'bg-gray-400 text-gray-600' 
                    : 'bg-[var(--app-primary)] hover:bg-[var(--app-primary)]/80 text-white'
                }`}
              >
                <Heart className={`w-4 h-4 mr-2 ${votedWorks.has(work.id) ? 'fill-current' : ''}`} />
                {votedWorks.has(work.id) ? 'Вы проголосовали' : 'Голосовать'}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default VotePage;
