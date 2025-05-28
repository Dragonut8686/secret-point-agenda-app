
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson, ThemeMainButton } from '@/config';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

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

const pageToPath = (pageName?: string): string => {
  if (!pageName) return '#';
  switch (pageName) {
    case "SchedulePage": return "/schedule";
    case "QuestionsPage": return "/questions";
    case "VotePage": return "/vote";
    case "HotelServicesPage": return "/hotel-services";
    case "HotelMapPage": return "/hotel-map";
    case "ContactsPage": return "/contacts";
    default:
      console.warn(`Unknown page name: ${pageName}`);
      return "#";
  }
};

const HomePage = () => {
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['eventDetails', EVENT_ID], 
    queryFn: fetchEventDetails
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg"
        >
          Загрузка мероприятия...
        </motion.p>
      </div>
    );
  }

  if (error || !event) {
    if (error) console.error("Error loading event data:", error);
    return (
      <div className="flex justify-center items-center min-h-[60vh] px-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          Error loading event details. Please check EVENT_ID and Supabase connection.
        </motion.p>
      </div>
    );
  }

  const theme = event.theme_json || {};

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-6 text-center">
      {theme.banner_url && (
        <motion.div 
          className="w-full -mx-4"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src={theme.banner_url} 
            alt={event.name ? `${event.name} Banner` : 'Event Banner'} 
            className="w-full h-48 object-cover"
          />
        </motion.div>
      )}
      
      <motion.h1 
        className="text-3xl font-bold px-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {event.name || 'Secret Point Event'}
      </motion.h1>
      
      <motion.nav 
        className="w-full px-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <ul className="space-y-4">
          {theme.main_buttons && theme.main_buttons.length > 0 ? (
            theme.main_buttons.map((button: ThemeMainButton, index: number) => (
              <motion.li key={button.page || `button-${index}`} variants={item}>
                <Button 
                  asChild 
                  variant="default" 
                  className="w-full bg-gradient-to-r from-[#3F2B96] to-[#5643cc] hover:from-[#4e37b0] hover:to-[#6651e0] text-white py-4 text-lg relative overflow-hidden group shadow-[0_0_20px_rgba(63,43,150,0.3)] hover:shadow-[0_0_30px_rgba(63,43,150,0.6)] transition-all duration-300 border-0 rounded-xl backdrop-blur-sm"
                >
                  <Link to={pageToPath(button.page)} className="flex items-center justify-center w-full h-full z-10">
                    <span className="relative z-10 font-medium">{button.label || `Button ${index + 1}`}</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  </Link>
                </Button>
              </motion.li>
            ))
          ) : (
            <Card className="p-6 bg-card border-border text-card-foreground">
              <p>No navigation buttons configured for this event.</p>
              <p className="text-sm text-muted-foreground mt-2">Please check the 'theme_json.main_buttons' in your Supabase event data.</p>
            </Card>
          )}
        </ul>
      </motion.nav>
    </div>
  );
};

export default HomePage;
