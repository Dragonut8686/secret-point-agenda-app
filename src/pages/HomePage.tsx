
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson, ThemeMainButton } from '@/config';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const fetchEventDetails = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('name, theme_json')
    .eq('id', EVENT_ID)
    .single();

  if (error) {
    console.error('Error fetching event details:', error);
    // Consider using maybeSingle() if an event not being found is a possible valid state
    // For now, we throw, which will be caught by react-query's error state
    throw new Error(error.message);
  }
  // It's good practice to ensure data is not null if .single() is used without .throwOnError()
  // but react-query handles the error state if the promise rejects.
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
    // Log the error for debugging if it's an actual error object
    if (error) console.error("Error loading event data:", error);
    return <div className="flex justify-center items-center h-screen"><p>Error loading event details. Please check EVENT_ID and Supabase connection.</p></div>;
  }

  const theme = event.theme_json || {};

  return (
    <div className="flex flex-col items-center space-y-6 text-center">
      {theme.banner_url && (
        <img 
          src={theme.banner_url} 
          alt={event.name ? `${event.name} Banner` : 'Event Banner'} 
          className="w-full h-48 object-cover shadow-lg" // Removed rounded-lg
        />
      )}
      {theme.logo_url && (
        <img 
          src={theme.logo_url} 
          alt={event.name ? `${event.name} Logo` : 'Event Logo'}
          className="w-32 h-32 object-contain rounded-full shadow-md"
        />
      )}
      <h1 className="text-3xl font-bold">{event.name || 'Secret Point Event'}</h1>
      
      <nav className="w-full max-w-xs">
        <ul className="space-y-3">
          {theme.main_buttons && theme.main_buttons.length > 0 ? (
            theme.main_buttons.map((button: ThemeMainButton, index: number) => ( // Added index for key if paths aren't unique
              <li key={button.path || `button-${index}`}> {/* Fallback key if path is not defined */}
                <Button asChild variant="default" className="w-full bg-[var(--app-primary)] hover:bg-opacity-80 text-white py-3 text-lg">
                  <Link to={button.path || '#'}>{button.title || `Button ${index + 1}`}</Link> {/* Fallback title and path */}
                </Button>
              </li>
            ))
          ) : (
            <Card className="p-4 bg-card border-border text-card-foreground"> {/* Use theme variables for card */}
              <p>No navigation buttons configured for this event.</p>
              <p className="text-sm text-muted-foreground mt-2">Please check the 'theme_json.main_buttons' in your Supabase event data.</p>
            </Card>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;

