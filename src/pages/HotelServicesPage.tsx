
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Wifi, Copy, Hotel, Coffee, Car, Utensils } from 'lucide-react';

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

  const { toast } = useToast();

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: 'Скопировано!',
        description: `${description} скопирован в буфер обмена`,
      });
    }).catch(() => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать',
        variant: 'destructive',
      });
    });
  };

  if (isLoading) return (
    <motion.div 
      className="text-center py-10 animate-pulse max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="text-lg">Загрузка информации об отеле...</p>
    </motion.div>
  );
  
  if (error || !theme || !theme.hotel_info) {
    return (
      <motion.div 
        className="text-center py-10 text-red-500 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>Ошибка загрузки информации об отеле</p>
        <p className="text-sm mt-2">Проверьте конфигурацию theme_json.</p>
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

  const getServiceIcon = (title: string) => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('wi-fi') || titleLower.includes('wifi') || titleLower.includes('интернет')) {
      return <Wifi className="w-6 h-6 text-blue-500" />;
    }
    if (titleLower.includes('завтрак') || titleLower.includes('ресторан') || titleLower.includes('питание')) {
      return <Utensils className="w-6 h-6 text-green-500" />;
    }
    if (titleLower.includes('парковка') || titleLower.includes('стоянка')) {
      return <Car className="w-6 h-6 text-purple-500" />;
    }
    if (titleLower.includes('кофе') || titleLower.includes('бар')) {
      return <Coffee className="w-6 h-6 text-amber-500" />;
    }
    return <Hotel className="w-6 h-6 text-indigo-500" />;
  };

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
        <motion.div 
          className="grid gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {services.map((service, index) => (
            <motion.div 
              key={index} 
              variants={item}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,0,0,0.4)] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {service.icon ? (
                        <span className="text-3xl">{service.icon}</span>
                      ) : (
                        getServiceIcon(service.title)
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-xl text-white mb-2">{service.title}</h3>
                      {service.description && (
                        <div className="flex items-center justify-between">
                          <p className="text-gray-300 text-sm flex-1">{service.description}</p>
                          {(service.title.toLowerCase().includes('wi-fi') || service.title.toLowerCase().includes('wifi')) && service.description && (
                            <Button
                              onClick={() => copyToClipboard(service.description!, 'Пароль Wi-Fi')}
                              variant="outline"
                              size="sm"
                              className="ml-3 bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Скопировать
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HotelServicesPage;
