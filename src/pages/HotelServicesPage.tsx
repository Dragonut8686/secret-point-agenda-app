import React, { useEffect } from 'react';
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

  // Автоматическая прокрутка к верху при загрузке страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <motion.div 
        className="text-center animate-pulse"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-lg text-white">Загрузка информации об отеле...</p>
      </motion.div>
    </div>
  );
  
  if (error || !theme || !theme.hotel_info) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <motion.div 
          className="text-center text-red-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-lg">Ошибка загрузки информации об отеле</p>
          <p className="text-sm mt-2">Проверьте конфигурацию theme_json.</p>
        </motion.div>
      </div>
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
      return <Wifi className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 flex-shrink-0" />;
    }
    if (titleLower.includes('завтрак') || titleLower.includes('ресторан') || titleLower.includes('питание')) {
      return <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 flex-shrink-0" />;
    }
    if (titleLower.includes('парковка') || titleLower.includes('стоянка')) {
      return <Car className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 flex-shrink-0" />;
    }
    if (titleLower.includes('кофе') || titleLower.includes('бар')) {
      return <Coffee className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 flex-shrink-0" />;
    }
    return <Hotel className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 flex-shrink-0" />;
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
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <motion.h1 
          className="text-2xl sm:text-3xl font-bold text-center text-white mb-6"
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
          className="w-full"
        >
          <motion.div 
            className="grid gap-3 sm:gap-4 w-full"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {services.map((service, index) => (
              <motion.div 
                key={index} 
                variants={item}
                transition={{ delay: 0.1 * index }}
                className="w-full"
              >
                <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,0,0,0.4)] transition-all duration-300 w-full">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4 w-full">
                      <div className="flex-shrink-0 mt-1">
                        {service.icon ? (
                          <span className="text-2xl sm:text-3xl">{service.icon}</span>
                        ) : (
                          getServiceIcon(service.title)
                        )}
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <h3 className="font-semibold text-lg sm:text-xl text-white mb-2 break-words">
                          {service.title}
                        </h3>
                        {service.description && (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                            <p className="text-gray-300 text-sm flex-1 break-words min-w-0">
                              {service.description}
                            </p>
                            {(service.title.toLowerCase().includes('wi-fi') || service.title.toLowerCase().includes('wifi')) && service.description && (
                              <Button
                                onClick={() => copyToClipboard(service.description!, 'Пароль Wi-Fi')}
                                variant="outline"
                                size="sm"
                                className="bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 flex-shrink-0 text-xs sm:text-sm"
                              >
                                <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">Скопировать пароль</span>
                                <span className="sm:hidden">Скопировать</span>
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
    </div>
  );
};

export default HotelServicesPage;
