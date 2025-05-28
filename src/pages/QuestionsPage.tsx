
import React from 'react';
import { motion } from 'framer-motion';

const QuestionsPage = () => {
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
        <p className="text-lg text-gray-300">Функция вопросов скоро будет доступна</p>
        <p className="text-sm text-gray-500 mt-2">Здесь вы сможете задавать вопросы спикерам</p>
      </motion.div>
    </div>
  );
};

export default QuestionsPage;
