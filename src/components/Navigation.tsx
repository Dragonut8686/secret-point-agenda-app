
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, List, Home, Calendar, Users, Phone, Vote } from 'lucide-react';
import { motion } from 'framer-motion';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Главная', icon: Home },
    { path: '/schedule', label: 'Расписание', icon: Calendar },
    { path: '/questions', label: 'Задать вопрос', icon: MessageCircle },
    { path: '/questions-list', label: 'Список вопросов', icon: List },
    { path: '/vote', label: 'Голосование', icon: Vote },
    { path: '/contacts', label: 'Контакты', icon: Phone },
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 bg-[var(--app-bg)]/95 backdrop-blur-lg border-t border-white/20 p-4 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 h-auto transition-colors ${
                isActive 
                  ? 'text-[var(--app-primary)] bg-[var(--app-primary)]/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default Navigation;
