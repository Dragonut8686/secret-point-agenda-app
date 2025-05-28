
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  description: string | null;
  day: string | null;
  time_from: string | null;
  time_to: string | null;
  speaker_id: string | null;
  speakers?: {
    name: string;
    bio: string | null;
    photo_url: string | null;
  };
}

const SchedulePage = () => {
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['sessions', EVENT_ID],
    queryFn: async () => {
      console.log('Fetching sessions for EVENT_ID:', EVENT_ID);
      const { data, error } = await supabase
        .from('sessions')
        .select(`
          *,
          speakers (
            name,
            bio,
            photo_url
          )
        `)
        .eq('event_id', EVENT_ID)
        .order('day', { ascending: true })
        .order('time_from', { ascending: true });

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      console.log('Sessions data received:', data);
      return data as Session[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Программа
        </motion.h1>
        
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-gray-300">Загрузка программы...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    console.error('Schedule page error:', error);
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Программа
        </motion.h1>
        
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-red-400">Ошибка загрузки программы</p>
          <p className="text-sm text-gray-500 mt-2">Попробуйте обновить страницу</p>
        </motion.div>
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <motion.h1 
          className="text-3xl font-bold text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Программа
        </motion.h1>
        
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-lg text-gray-300">Программа пока не опубликована</p>
          <p className="text-sm text-gray-500 mt-2">Следите за обновлениями</p>
        </motion.div>
      </div>
    );
  }

  // Group sessions by day
  const sessionsByDay = sessions.reduce((acc, session) => {
    const day = session.day || 'Без даты';
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.h1 
        className="text-3xl font-bold text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Программа
      </motion.h1>
      
      <motion.div
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {Object.entries(sessionsByDay).map(([day, daySessions], dayIndex) => (
          <motion.div 
            key={day}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: dayIndex * 0.1 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-[var(--app-primary)]">{day}</h2>
            <div className="space-y-4">
              {daySessions.map((session, sessionIndex) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (dayIndex * 0.1) + (sessionIndex * 0.05) }}
                >
                  <Card className="bg-[var(--card-bg)] border-[var(--card-border)] hover:shadow-lg transition-all duration-300 hover:shadow-[var(--app-primary)]/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center justify-between flex-wrap gap-2">
                        <span>{session.title}</span>
                        {(session.time_from || session.time_to) && (
                          <span className="flex items-center text-[var(--app-primary)] text-sm font-medium">
                            <Clock className="w-4 h-4 mr-1" />
                            {session.time_from && session.time_to 
                              ? `${session.time_from} - ${session.time_to}`
                              : session.time_from || session.time_to
                            }
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {session.description && (
                        <p className="text-gray-300">{session.description}</p>
                      )}
                      {session.speakers && (
                        <div className="flex items-center text-[var(--app-primary)]">
                          <User className="w-4 h-4 mr-2" />
                          <span className="font-medium">{session.speakers.name}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default SchedulePage;
