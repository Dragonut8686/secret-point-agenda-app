
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, User, Clock } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  author_name: string | null;
  created_at: string;
  is_anonymous: boolean | null;
  is_answered: boolean | null;
  is_approved: boolean | null;
}

const QuestionsPage = () => {
  const [questionText, setQuestionText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: questions, isLoading, error, refetch } = useQuery({
    queryKey: ['questions', EVENT_ID],
    queryFn: async () => {
      console.log('Fetching questions for EVENT_ID:', EVENT_ID);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('event_id', EVENT_ID)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      console.log('Questions data received:', data);
      return data as Question[];
    },
  });

  const submitQuestion = async () => {
    if (!questionText.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите текст вопроса",
        variant: "destructive",
      });
      return;
    }

    if (!isAnonymous && !authorName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите ваше имя или выберите анонимный вопрос",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          event_id: EVENT_ID,
          text: questionText.trim(),
          author_name: isAnonymous ? null : authorName.trim(),
          is_anonymous: isAnonymous,
          is_approved: true, // Auto-approve for now
        });

      if (error) {
        console.error('Error submitting question:', error);
        throw error;
      }

      toast({
        title: "Успешно!",
        description: "Ваш вопрос отправлен",
      });

      setQuestionText('');
      setAuthorName('');
      setIsAnonymous(false);
      refetch();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить вопрос",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
          Вопросы
        </motion.h1>
        
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-gray-300">Загрузка вопросов...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    console.error('Questions page error:', error);
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Вопросы
        </motion.h1>
        
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-red-400">Ошибка загрузки вопросов</p>
          <p className="text-sm text-gray-500 mt-2">Попробуйте обновить страницу</p>
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
        Вопросы
      </motion.h1>
      
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Question submission form */}
        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-[var(--app-primary)]" />
              Задать вопрос
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Введите ваш вопрос..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              className="bg-[var(--input-bg)] border-[var(--input-border)] text-white placeholder-gray-400"
            />
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <label htmlFor="anonymous" className="text-sm text-gray-300">
                Анонимный вопрос
              </label>
            </div>

            {!isAnonymous && (
              <Input
                placeholder="Ваше имя"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-[var(--input-bg)] border-[var(--input-border)] text-white placeholder-gray-400"
              />
            )}

            <Button 
              onClick={submitQuestion}
              disabled={isSubmitting}
              className="w-full bg-[var(--app-primary)] hover:bg-[var(--app-primary)]/80 text-white"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить вопрос'}
            </Button>
          </CardContent>
        </Card>

        {/* Questions list */}
        {questions && questions.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Заданные вопросы</h2>
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="bg-[var(--card-bg)] border-[var(--card-border)] hover:shadow-lg transition-all duration-300 hover:shadow-[var(--app-primary)]/20">
                  <CardContent className="pt-4">
                    <p className="text-white mb-3">{question.text}</p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {question.is_anonymous ? 'Анонимный вопрос' : question.author_name}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(question.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-300">Вопросов пока нет</p>
            <p className="text-sm text-gray-500 mt-2">Будьте первым, кто задаст вопрос!</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QuestionsPage;
