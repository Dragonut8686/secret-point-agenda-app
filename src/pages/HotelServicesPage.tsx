
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson } from '@/config';
import { Card, CardContent } from '@/components/ui/card';
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

const HotelServicesPage = () => {
  const { data: theme, isLoading, error } = useQuery({
    queryKey: ['eventThemeForHotel', EVENT_ID],
    queryFn: fetchEventTheme
  });

  if (isLoading) return (
    <motion.div 
      className="text-center py-10 animate-pulse max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="text-lg">Loading hotel information...</p>
    </motion.div>
  );
  
  if (error || !theme || !theme.hotel_info) {
    return (
      <motion.div 
        className="text-center py-10 text-red-500 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>Error loading hotel information or no info provided.</p>
        <p className="text-sm mt-2">Please check your theme_json configuration.</p>
      </motion.div>
    );
  }

  const services = theme.hotel_info.split('\\n').map((line, index) => {
    const match = line.match(/^(\p{Emoji}\s*)?(.+?)(:\s*(.*))?$/u);
    if (match) {
      return {
        icon: match[1]?.trim() || null,
        title: match[2]?.trim(),
        description: match[4]?.trim() || null,
      };
    }
    return { icon: null, title: line, description: null };
  });

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
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.h1 
        className="text-3xl font-bold text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Услуги отеля
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.3)]">
          <CardContent className="py-6">
            <motion.div 
              className="space-y-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {services.map((service, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start space-x-3"
                  variants={item}
                  transition={{ delay: 0.1 * index }}
                >
                  {service.icon && (
                    <span className="text-2xl flex-shrink-0 mt-1">{service.icon}</span>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-white">{service.title}</h3>
                    {service.description && (
                      <p className="text-gray-300 text-sm">{service.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default HotelServicesPage;
