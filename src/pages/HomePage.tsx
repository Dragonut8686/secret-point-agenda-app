
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
      return "#"; // Fallback for unknown pages
  }
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
    if (error) console.error("Error loading event data:", error);
    return <div className="flex justify-center items-center h-screen"><p>Error loading event details. Please check EVENT_ID and Supabase connection.</p></div>;
  }

  const theme = event.theme_json || {};

  // Button animation variants for staggered appearance
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
    <div className="flex flex-col items-center space-y-6 text-center">
      {theme.banner_url && (
        <div className="w-full">
          <motion.img 
            src={theme.banner_url} 
            alt={event.name ? `${event.name} Banner` : 'Event Banner'} 
            className="w-full h-48 object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
      
      {/* Logo is temporarily hidden but structure remains for easy restoration */}
      {/* {theme.logo_url && (
        <motion.img 
          src={theme.logo_url} 
          alt={event.name ? `${event.name} Logo` : 'Event Logo'}
          className="w-32 h-32 object-contain rounded-full shadow-md"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
        />
      )} */}
      
      <motion.h1 
        className="text-3xl font-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {event.name || 'Secret Point Event'}
      </motion.h1>
      
      <motion.nav 
        className="w-full max-w-xs px-4"
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
                  className="w-full bg-gradient-to-r from-[#3F2B96] to-[#5643cc] hover:from-[#4e37b0] hover:to-[#6651e0] text-white py-3 text-lg relative overflow-hidden group shadow-[0_0_15px_rgba(63,43,150,0.5)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(63,43,150,0.7)]"
                >
                  <Link to={pageToPath(button.page)} className="flex items-center justify-center w-full h-full z-10">
                    <span className="relative z-10">{button.label || `Button ${index + 1}`}</span>
                    <span className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Link>
                </Button>
              </motion.li>
            ))
          ) : (
            <Card className="p-4 bg-card border-border text-card-foreground">
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
