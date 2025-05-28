
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson } from '@/config';
import { motion } from 'framer-motion';

const fetchEventTheme = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('theme_json')
    .eq('id', EVENT_ID)
    .single();

  if (error) throw new Error(error.message);
  return data?.theme_json as ThemeJson | null;
};

const HotelMapPage = () => {
  const { data: theme, isLoading, error } = useQuery({
    queryKey: ['eventThemeForMap', EVENT_ID],
    queryFn: fetchEventTheme
  });

  if (isLoading) return (
    <motion.div 
      className="text-center py-10 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      Loading map...
    </motion.div>
  );
  
  if (error || !theme || !theme.map_url) return (
    <motion.div 
      className="text-center py-10 text-red-500 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      Error loading map or map URL not provided.
    </motion.div>
  );

  return (
    <div className="space-y-6 flex flex-col h-full max-w-4xl mx-auto">
      <motion.h1 
        className="text-3xl font-bold text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Карта отеля
      </motion.h1>
      <motion.div 
        className="flex-grow flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <img 
          src={theme.map_url} 
          alt="Hotel Map" 
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
        />
      </motion.div>
    </div>
  );
};

export default HotelMapPage;
