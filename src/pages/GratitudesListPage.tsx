
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Gratitude {
  id: string;
  user_name: string;
  text: string;
  created_at: string;
}

const GratitudesListPage = () => {
  const { data: gratitudes, isLoading, error } = useQuery({
    queryKey: ['gratitudes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gratitudes')
        .select('id, user_name, text, created_at')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Gratitude[];
    },
  });

  if (isLoading) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-[var(--app-bg)] to-slate-900 p-4 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка благодарностей...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="min-h-screen bg-gradient-to-br from-[var(--app-bg)] to-slate-900 p-4 flex items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center text-red-400">
          <p>Ошибка загрузки благодарностей</p>
        </div>
      </motion.div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[var(--app-bg)] to-slate-900 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Список благодарностей</h1>
          <p className="text-gray-400">Слова признательности от участников</p>
        </motion.div>

        {/* Gratitudes List */}
        {!gratitudes || gratitudes.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-400 text-lg">Пока благодарностей нет</p>
            <p className="text-gray-500 text-sm mt-2">Станьте первым, кто выразит благодарность!</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {gratitudes.map((gratitude) => (
              <motion.div
                key={gratitude.id}
                variants={item}
                transition={{ duration: 0.3, type: "spring", damping: 15 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    {/* Gratitude Text */}
                    <div className="mb-4">
                      <p className="text-white text-lg leading-relaxed font-medium">
                        💬 <strong>{gratitude.user_name}:</strong> {gratitude.text}
                      </p>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      {/* Author */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-pink-500" />
                        <span className="font-medium">От:</span>
                        <span className="text-white">{gratitude.user_name}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-pink-500" />
                        <span className="font-medium">Время:</span>
                        <span className="text-white">
                          {format(new Date(gratitude.created_at), 'dd MMMM, HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GratitudesListPage;
