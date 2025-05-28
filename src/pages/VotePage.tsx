
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Heart, Play, Image as ImageIcon } from 'lucide-react';

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
      const { data, error } = await supabase
        .from('works')
        .update({ 
          votes_count: works?.find(w => w.id === workId)?.votes_count! + 1 
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
        title: "Голос засчитан!",
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
        description: "За эту работу уже можно голосовать только один раз",
        variant: "destructive",
      });
      return;
    }
    voteMutation.mutate(workId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Конкурс
        </motion.h1>
        
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-gray-300">Загрузка работ...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    console.error('Vote page error:', error);
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Конкурс
        </motion.h1>
        
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-red-400">Ошибка загрузки конкурса</p>
          <p className="text-sm text-gray-500 mt-2">Попробуйте обновить страницу</p>
        </motion.div>
      </div>
    );
  }

  if (!works || works.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Конкурс
        </motion.h1>
        
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-gray-300">Конкурсные работы пока не загружены</p>
          <p className="text-sm text-gray-500 mt-2">Следите за обновлениями!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.h1 
        className="text-3xl font-bold text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Конкурс
      </motion.h1>
      
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-[var(--app-primary)] mr-2" />
          <p className="text-lg text-gray-300">Голосуйте за лучшие работы</p>
        </div>
        <p className="text-sm text-gray-500">Нажмите на сердечко, чтобы проголосовать</p>
      </motion.div>

      <motion.div
        className="grid gap-6 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {works.map((work, index) => (
          <motion.div
            key={work.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] hover:shadow-lg transition-all duration-300 hover:shadow-[var(--app-primary)]/20 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="truncate">{work.title}</span>
                  <div className="flex items-center text-[var(--app-primary)] ml-2">
                    <Heart className="w-4 h-4 mr-1" />
                    <span className="font-bold">{work.votes_count}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {work.photo_url && (
                  <div className="relative w-full h-48 bg-gray-800 rounded-lg overflow-hidden">
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

                {work.video_url && (
                  <div className="flex items-center text-[var(--app-primary)]">
                    <Play className="w-4 h-4 mr-2" />
                    <a 
                      href={work.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:underline"
                    >
                      Посмотреть видео
                    </a>
                  </div>
                )}

                {work.author_name && (
                  <p className="text-[var(--app-primary)] font-medium">
                    Автор: {work.author_name}
                  </p>
                )}

                {work.description && (
                  <p className="text-gray-300 text-sm">{work.description}</p>
                )}

                <Button 
                  onClick={() => handleVote(work.id)}
                  disabled={votedWorks.has(work.id) || voteMutation.isPending}
                  className={`w-full ${
                    votedWorks.has(work.id) 
                      ? 'bg-gray-600 text-gray-400' 
                      : 'bg-[var(--app-primary)] hover:bg-[var(--app-primary)]/80 text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${votedWorks.has(work.id) ? 'fill-current' : ''}`} />
                  {votedWorks.has(work.id) ? 'Вы проголосовали' : 'Голосовать'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default VotePage;
