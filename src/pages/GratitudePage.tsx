
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Heart, Send } from 'lucide-react';

const user = window.Telegram?.WebApp?.initDataUnsafe?.user;

const GratitudePage = () => {
  const [gratitudeText, setGratitudeText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAnonymousChange = (checked: boolean | "indeterminate") => {
    setIsAnonymous(checked === true);
  };

  const submitGratitude = async () => {
    if (!gratitudeText.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите текст благодарности',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось получить данные пользователя',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = String(user.id);
      const userName = `${user.first_name} ${user.last_name || ''}`.trim();

      const { error } = await supabase.from('gratitudes').insert({
        user_id: userId,
        user_name: userName,
        text: gratitudeText.trim(),
        is_anonymous: isAnonymous,
      });

      if (error) throw error;

      toast({ 
        title: 'Спасибо!', 
        description: 'Ваша благодарность добавлена.' 
      });
      setGratitudeText('');
      setIsAnonymous(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить благодарность',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
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
        <h1 className="text-3xl font-bold text-white mb-2">Написать благодарность</h1>
        <p className="text-gray-400">Поделитесь своими впечатлениями и благодарностью</p>
      </motion.div>

      {/* Form Card */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="space-y-5">
          {/* Gratitude Text */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <Heart className="w-4 h-4 text-pink-500" />
              Ваша благодарность
            </label>
            <Textarea
              placeholder="Напишите вашу благодарность организаторам, спикерам или участникам..."
              value={gratitudeText}
              onChange={(e) => setGratitudeText(e.target.value)}
              className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-pink-500 focus:ring-pink-500/20 rounded-xl resize-none"
              maxLength={500}
            />
            <div className="text-xs text-gray-400 text-right">
              {gratitudeText.length}/500
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={handleAnonymousChange}
              className="border-white/20 data-[state=checked]:bg-pink-500"
            />
            <label
              htmlFor="anonymous"
              className="text-sm font-medium text-gray-200 cursor-pointer"
            >
              Отправить анонимно
            </label>
          </div>

          {/* Submit Button */}
          <Button
            onClick={submitGratitude}
            disabled={isSubmitting || !gratitudeText.trim()}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold h-11 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Отправка...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Отправить благодарность
              </div>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        className="mt-6 p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-pink-200 text-center">
          💖 Ваша благодарность появится в общем списке и поможет создать атмосферу взаимного уважения
        </p>
      </motion.div>
    </motion.div>
  );
};

export default GratitudePage;
