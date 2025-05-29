
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson, ThemeContact } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';
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

  const copyEmailToClipboard = (email: string) => {
    navigator.clipboard.writeText(email).then(() => {
      toast({
        title: 'Email скопирован',
        description: `${email} скопирован в буфер обмена`,
      });
    }).catch(() => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось скопировать email',
        variant: 'destructive',
      });
    });
  };

  console.log('Theme in component:', theme);
  console.log('Contacts array:', theme?.contacts);

  if (isLoading) return (
    <motion.div 
      className="text-center py-10 animate-pulse max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <p className="text-lg">Загрузка контактов...</p>
    </motion.div>
  );
  
  if (error) {
    console.error('Error loading contacts:', error);
    return (
      <motion.div 
        className="text-center py-10 text-red-500 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>Ошибка загрузки контактов</p>
        <p className="text-sm mt-2">Проверьте конфигурацию theme_json в Supabase</p>
      </motion.div>
    );
  }

  if (!theme) {
    return (
      <motion.div 
        className="text-center py-10 text-yellow-500 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>Тема мероприятия не найдена</p>
        <p className="text-sm mt-2">Убедитесь, что EVENT_ID корректен в config.ts</p>
      </motion.div>
    );
  }

  if (!theme.contacts || theme.contacts.length === 0) {
    return (
      <motion.div 
        className="text-center py-10 text-orange-500 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p>Контакты не настроены</p>
        <p className="text-sm mt-2">Добавьте контакты в поле theme_json.contacts в Supabase</p>
        <p className="text-xs mt-2 text-gray-400">
          Формат: {`{"contacts": [{"name": "Имя", "phone": "+7...", "email": "..."}]}`}
        </p>
      </motion.div>
    );
  }

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
        {theme.contacts.map((contact: ThemeContact, index: number) => (
          <motion.div 
            key={index} 
            variants={item}
            transition={{ duration: 0.3, type: "spring", damping: 15 }}
          >
            <Card className="bg-gray-800/80 border-gray-700 backdrop-blur-sm overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#3F2B96]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <span className="mr-2">👤</span> {contact.name || 'Не указано имя'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.phone && (
                  <Button asChild variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700 group overflow-hidden relative">
                    <a href={`tel:${contact.phone}`} className="flex items-center space-x-2">
                      <Phone className="text-[var(--app-primary)]" size={18} />
                      <span>{contact.phone}</span>
                      <span className="absolute inset-0 bg-[var(--app-primary)]/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    </a>
                  </Button>
                )}
                {contact.email && (
                  <Button 
                    onClick={() => copyEmailToClipboard(contact.email!)}
                    variant="outline" 
                    className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700 group overflow-hidden relative"
                  >
                    <div className="flex items-center space-x-2">
                      <Mail className="text-[var(--app-primary)]" size={18} />
                      <span>{contact.email}</span>
                      <span className="absolute inset-0 bg-[var(--app-primary)]/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                    </div>
                  </Button>
                )}
                {!contact.phone && !contact.email && (
                  <p className="text-gray-400 text-sm">Контактная информация не указана</p>
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
