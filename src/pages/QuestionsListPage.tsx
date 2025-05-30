
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, User, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Question {
  id: string;
  text: string;
  author_name: string | null;
  author_username: string | null;
  is_anonymous: boolean;
  created_at: string;
  answer_text: string | null;
  answered_at: string | null;
  is_answered: boolean;
  speakers: {
    name: string;
  } | null;
}

const QuestionsListPage = () => {
  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['questions', EVENT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          text,
          author_name,
          author_username,
          is_anonymous,
          created_at,
          answer_text,
          answered_at,
          is_answered,
          speakers (
            name
          )
        `)
        .eq('event_id', EVENT_ID)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Question[];
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--app-primary)] mx-auto mb-4"></div>
          <p className="text-gray-400">Загрузка вопросов...</p>
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
          <p>Ошибка загрузки вопросов</p>
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[var(--app-primary)] to-purple-600 rounded-2xl mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Список вопросов</h1>
          <p className="text-gray-400">Все заданные вопросы спикерам</p>
        </motion.div>

        {/* Questions List */}
        {!questions || questions.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-gray-400 text-lg">Пока вопросов нет</p>
            <p className="text-gray-500 text-sm mt-2">Станьте первым, кто задаст вопрос!</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {questions.map((question) => (
              <motion.div
                key={question.id}
                variants={item}
                transition={{ duration: 0.3, type: "spring", damping: 15 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardContent className="p-6">
                    {/* Question Text */}
                    <div className="mb-4">
                      <p className="text-white text-lg leading-relaxed font-medium">
                        {question.text}
                      </p>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                      {/* Speaker */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--app-primary)]" />
                        <span className="font-medium">Спикер:</span>
                        <span className="text-white">
                          {question.speakers?.name || 'Не указан'}
                        </span>
                      </div>

                      {/* Author */}
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[var(--app-primary)]" />
                        <span className="font-medium">От:</span>
                        <span className="text-white">
                          {question.is_anonymous 
                            ? 'Анонимно' 
                            : question.author_name || question.author_username || 'Неизвестно'
                          }
                        </span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--app-primary)]" />
                        <span className="font-medium">Время:</span>
                        <span className="text-white">
                          {format(new Date(question.created_at), 'dd MMMM, HH:mm', { locale: ru })}
                        </span>
                      </div>
                    </div>

                    {/* Answer Block */}
                    {question.answer_text && (
                      <div className="p-4 mt-4 bg-white/10 border border-green-500/30 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-semibold text-green-400">Ответ от {question.speakers?.name}:</span>
                        </div>
                        <p className="text-white leading-relaxed">{question.answer_text}</p>
                        {question.answered_at && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(question.answered_at), 'dd MMMM, HH:mm', { locale: ru })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
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

export default QuestionsListPage;
