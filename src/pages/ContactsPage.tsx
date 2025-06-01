
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Phone, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const fetchEventTheme = async () => {
  console.log('Fetching event theme for contacts, EVENT_ID:', EVENT_ID);
  const { data, error } = await supabase
    .from('events')
    .select('theme_json')
    .eq('id', EVENT_ID)
    .single();

  console.log('Theme data received:', data);
  console.log('Error if any:', error);

  if (error) throw new Error(error.message);
  return data?.theme_json as ThemeJson | null;
};

const ContactsPage = () => {
  const { data: theme, isLoading, error } = useQuery({
    queryKey: ['eventThemeForContacts', EVENT_ID],
    queryFn: fetchEventTheme
  });

  const { toast } = useToast();

  console.log('Theme in component:', theme);

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
      <p className="text-lg">Загрузка контактов...</p>
    </motion.div>
  );
  
  if (error || !theme || !theme.contacts || theme.contacts.length === 0) {
    console.error('Error loading contacts:', error);
    return (
      <motion.div 
        className="text-center py-10 text-red-500 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>Ошибка загрузки контактов</p>
        <p className="text-sm mt-2">Проверьте конфигурацию contacts в theme_json</p>
      </motion.div>
    );
  }

  const getTelegramLink = (telegram: string) => {
    if (telegram && telegram.startsWith('@')) {
      return `https://t.me/${telegram.substring(1)}`;
    }
    return null;
  };

  const getPhoneLink = (phone: string) => {
    if (phone && phone.match(/^\+?[\d\s\-\(\)]+$/)) {
      return `tel:${phone}`;
    }
    return null;
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
        Контакты
      </motion.h1>
      
      <motion.div 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {theme.contacts.map((contact, index) => (
          <motion.div 
            key={index}
            variants={item}
            transition={{ duration: 0.3, type: "spring", damping: 15 }}
          >
            <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm overflow-hidden relative group shadow-[0_0_15px_rgba(0,0,0,0.3)] hover:shadow-[0_0_25px_rgba(0,0,0,0.4)] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3F2B96]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <div className="mr-3">
                    {contact.icon ? (
                      <span className="text-3xl">{contact.icon}</span>
                    ) : (
                      <User className="w-6 h-6 text-indigo-500" />
                    )}
                  </div>
                  {contact.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Telegram - первый пункт */}
                {contact.telegram && (
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700 group overflow-hidden relative"
                  >
                    <a href={getTelegramLink(contact.telegram)!} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                      <Send className="w-5 h-5 text-blue-500" />
                      <span>{contact.telegram}</span>
                      <span className="absolute inset-0 bg-[var(--app-primary)]/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    </a>
                  </Button>
                )}

                {/* Phone - второй пункт */}
                {contact.phone && getPhoneLink(contact.phone) && (
                  <Button 
                    asChild 
                    variant="outline" 
                    className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700 group overflow-hidden relative"
                  >
                    <a href={getPhoneLink(contact.phone)!} className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-purple-500" />
                      <span>{contact.phone}</span>
                      <span className="absolute inset-0 bg-[var(--app-primary)]/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    </a>
                  </Button>
                )}

                {/* Email - третий пункт */}
                {contact.email && (
                  <Button 
                    onClick={() => copyToClipboard(contact.email!, 'Email')}
                    variant="outline" 
                    className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700 group overflow-hidden relative"
                  >
                    <Mail className="w-5 h-5 text-green-500 mr-2" />
                    <span>{contact.email}</span>
                    <span className="absolute inset-0 bg-[var(--app-primary)]/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ContactsPage;
