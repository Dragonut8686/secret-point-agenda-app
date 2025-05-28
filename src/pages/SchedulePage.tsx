
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
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
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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
      <motion.div 
        className="min-h-screen p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-screen-sm mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Программа</h1>
          <p className="text-center text-gray-500">Загрузка программы...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    console.error('Schedule page error:', error);
    return (
      <motion.div 
        className="min-h-screen p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-screen-sm mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Программа</h1>
          <p className="text-center text-red-500">Ошибка загрузки программы</p>
        </div>
      </motion.div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <motion.div 
        className="min-h-screen p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-screen-sm mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Программа</h1>
          <p className="text-center text-gray-500">Программа пока не опубликована</p>
        </div>
      </motion.div>
    );
  }

  // Get unique days
  const uniqueDays = Array.from(new Set(sessions.map(session => session.day).filter(Boolean)));
  const currentSelectedDay = selectedDay || uniqueDays[0];

  // Filter sessions by selected day
  const filteredSessions = sessions.filter(session => session.day === currentSelectedDay);

  return (
    <motion.div 
      className="min-h-screen p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-screen-sm mx-auto">
        <motion.h1 
          className="text-2xl font-bold text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Программа
        </motion.h1>
        
        {/* Day filter buttons */}
        {uniqueDays.length > 1 && (
          <motion.div 
            className="flex flex-wrap gap-2 justify-center mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {uniqueDays.map((day, index) => (
              <motion.button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentSelectedDay === day
                    ? 'bg-[var(--app-primary)] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {day}
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Sessions list */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session, index) => (
              <motion.div
                key={session.id}
                className="bg-white text-black rounded-xl shadow-sm p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
              >
                {(session.time_from || session.time_to) && (
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <Clock className="w-4 h-4 mr-2" />
                    {session.time_from && session.time_to 
                      ? `${session.time_from} – ${session.time_to}`
                      : session.time_from || session.time_to
                    }
                  </div>
                )}
                
                <h3 className="font-bold text-lg mb-2">{session.title}</h3>
                
                {session.speakers && (
                  <div className="flex items-center text-gray-700 mb-2">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">{session.speakers.name}</span>
                  </div>
                )}
                
                {session.description && (
                  <p className="text-gray-500 text-sm">{session.description}</p>
                )}
              </motion.div>
            ))
          ) : (
            <motion.p 
              className="text-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Нет запланированных сессий
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SchedulePage;
