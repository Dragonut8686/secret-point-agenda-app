
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database } from '@/integrations/supabase/types';

type Session = Database['public']['Tables']['sessions']['Row'] & {
  speakers: Database['public']['Tables']['speakers']['Row'] | null;
};

const fetchSchedule = async () => {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      speakers ( name )
    `)
    .eq('event_id', EVENT_ID)
    .order('day', { ascending: true })
    .order('time_from', { ascending: true });

  if (error) {
    console.error('Error fetching schedule:', error);
    throw new Error(error.message);
  }
  return data as Session[];
};

const SchedulePage = () => {
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['schedule', EVENT_ID],
    queryFn: fetchSchedule
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  if (isLoading) return <div className="text-center py-10">Loading schedule...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading schedule.</div>;
  if (!sessions || sessions.length === 0) {
    return <div className="text-center py-10">No sessions found for this event.</div>;
  }

  const days = Array.from(new Set(sessions.map(s => s.day).filter(Boolean))).sort();

  // Set initial selected day
  if (!selectedDay && days.length > 0) {
    setSelectedDay(days[0]);
  }

  const filteredSessions = selectedDay ? sessions.filter(s => s.day === selectedDay) : sessions;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center mb-6">Расписание</h1>
      
      {days.length > 0 && (
        <div className="flex justify-center space-x-2 mb-6 overflow-x-auto pb-2">
          {days.map(day => (
            <Button 
              key={day} 
              onClick={() => setSelectedDay(day)}
              variant={selectedDay === day ? "default" : "outline"}
              className={`whitespace-nowrap ${selectedDay === day ? 'bg-[var(--app-primary)] text-white' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
            >
              {day}
            </Button>
          ))}
        </div>
      )}

      {filteredSessions.length > 0 ? (
        <div className="space-y-4">
          {filteredSessions.map(session => (
            <Card key={session.id} className="bg-white text-black rounded-xl shadow-sm p-4 max-w-screen-sm mx-auto">
              <CardHeader className="p-0 pb-2">
                <p className="text-sm text-gray-600">{session.time_from} – {session.time_to}</p>
                <CardTitle className="text-xl font-bold">{session.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-1">
                {session.speakers && (
                  <p className="text-md">Спикер: {session.speakers.name}</p>
                )}
                {session.description && (
                  <p className="text-sm text-gray-500">{session.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-5">Нет запланированных сессий на {selectedDay || "выбранный день"}.</p>
      )}
    </div>
  );
};

export default SchedulePage;
