
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson, ThemeMainButton } from '@/config';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Assuming Button component is available
import { Card } from '@/components/ui/card';

const fetchEventDetails = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('name, theme_json')
    .eq('id', EVENT_ID)
    .single();

  if (error) {
    console.error('Error fetching event details:', error);
    throw new Error(error.message);
  }
  return data as { name: string; theme_json: ThemeJson | null };
};

const HomePage = () => {
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['eventDetails', EVENT_ID], 
    queryFn: fetchEventDetails
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading event...</p></div>;
  }

  if (error || !event) {
    return <div className="flex justify-center items-center h-screen"><p>Error loading event details.</p></div>;
  }

  const theme = event.theme_json || {};

  return (
    <div className="flex flex-col items-center space-y-6 text-center">
      {theme.banner_url && (
        <img 
          src={theme.banner_url} 
          alt={`${event.name} Banner`} 
          className="w-full h-48 object-cover rounded-lg shadow-lg" 
        />
      )}
      {theme.logo_url && (
        <img 
          src={theme.logo_url} 
          alt={`${event.name} Logo`} 
          className="w-32 h-32 object-contain rounded-full shadow-md" // Adjusted size and shape
        />
      )}
      <h1 className="text-3xl font-bold">{event.name || 'Secret Point Event'}</h1>
      
      <nav className="w-full max-w-xs">
        <ul className="space-y-3">
          {theme.main_buttons && theme.main_buttons.length > 0 ? (
            theme.main_buttons.map((button: ThemeMainButton) => (
              <li key={button.path}>
                <Button asChild variant="default" className="w-full bg-[var(--app-primary)] hover:bg-opacity-80 text-white py-3 text-lg">
                  <Link to={button.path}>{button.title}</Link>
                </Button>
              </li>
            ))
          ) : (
            <Card className="p-4 bg-gray-800 border-gray-700">
              <p className="text-gray-400">No navigation buttons configured for this event.</p>
            </Card>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
