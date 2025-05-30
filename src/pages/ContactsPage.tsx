
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, Phone, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

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

  console.log('Theme in component:', theme);

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

  const getContactIcon = (contact: any) => {
    const name = contact.name?.toLowerCase() || '';
    const phone = contact.phone?.toLowerCase() || '';
    const email = contact.email?.toLowerCase() || '';
    
    if (contact.icon) {
      return <span className="text-3xl">{contact.icon}</span>;
    }
    
    if (phone.includes('telegram') || phone.includes('@') || phone.startsWith('t.me')) {
      return <Send className="w-6 h-6 text-blue-500" />;
    }
    if (email || name.includes('email') || name.includes('почта')) {
      return <Mail className="w-6 h-6 text-green-500" />;
    }
    if (phone || name.includes('телефон') || name.includes('phone')) {
      return <Phone className="w-6 h-6 text-purple-500" />;
    }
    
    return <User className="w-6 h-6 text-indigo-500" />;
  };

  const getContactLink = (contact: any) => {
    if (contact.phone) {
      const phone = contact.phone.trim();
      // Если это Telegram nickname (начинается с @)
      if (phone.startsWith('@')) {
        return `https://t.me/${phone.substring(1)}`;
      }
      // Если это уже ссылка на t.me
      if (phone.startsWith('t.me/') || phone.startsWith('https://t.me/')) {
        return phone.startsWith('https://') ? phone : `https://${phone}`;
      }
      // Если это обычный телефон
      if (phone.match(/^\+?[\d\s\-\(\)]+$/)) {
        return `tel:${phone}`;
      }
      // Если это другая ссылка
      if (phone.startsWith('http://') || phone.startsWith('https://')) {
        return phone;
      }
    }
    
    if (contact.email) {
      return `mailto:${contact.email}`;
    }
    
    return null;
  };

  const getContactDisplayText = (contact: any) => {
    if (contact.phone && contact.phone.startsWith('@')) {
      return contact.phone;
    }
    return contact.phone || contact.email || 'Связаться';
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
        {theme.contacts.map((contact, index) => {
          const link = getContactLink(contact);
          const displayText = getContactDisplayText(contact);
          
          return (
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
                      {getContactIcon(contact)}
                    </div>
                    {contact.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {link ? (
                    <Button 
                      asChild 
                      variant="outline" 
                      className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700 group overflow-hidden relative"
                    >
                      <a href={link} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                        {getContactIcon(contact)}
                        <span>{displayText}</span>
                        <span className="absolute inset-0 bg-[var(--app-primary)]/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                      </a>
                    </Button>
                  ) : (
                    <div className="flex items-center space-x-2 text-gray-300 p-3 border border-gray-600 rounded">
                      {getContactIcon(contact)}
                      <span>{displayText}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ContactsPage;
