
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson } from '@/config';

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

  if (isLoading) return <div className="text-center py-10">Loading map...</div>;
  if (error || !theme || !theme.map_url) return <div className="text-center py-10 text-red-500">Error loading map or map URL not provided.</div>;

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h1 className="text-3xl font-bold text-center">Карта отеля</h1>
      <div className="flex-grow flex justify-center items-center">
        <img 
          src={theme.map_url} 
          alt="Hotel Map" 
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
        />
      </div>
    </div>
  );
};

export default HotelMapPage;
