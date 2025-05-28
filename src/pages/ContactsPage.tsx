
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson, ThemeContact } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail } from 'lucide-react';

const fetchEventTheme = async () => {
  const { data, error } = await supabase
    .from('events')
    .select('theme_json')
    .eq('id', EVENT_ID)
    .single();

  if (error) throw new Error(error.message);
  return data?.theme_json as ThemeJson | null;
};

const ContactsPage = () => {
  const { data: theme, isLoading, error } = useQuery({
    queryKey: ['eventThemeForContacts', EVENT_ID],
    queryFn: fetchEventTheme
  });

  if (isLoading) return <div className="text-center py-10">Loading contacts...</div>;
  if (error || !theme || !theme.contacts || theme.contacts.length === 0) {
    return <div className="text-center py-10 text-red-500">Error loading contacts or no contacts provided.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Контакты</h1>
      <div className="space-y-4">
        {theme.contacts.map((contact: ThemeContact, index: number) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">{contact.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {contact.phone && (
                <Button asChild variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700">
                  <a href={`tel:${contact.phone}`} className="flex items-center space-x-2">
                    <Phone size={18} />
                    <span>{contact.phone}</span>
                  </a>
                </Button>
              )}
              {contact.email && (
                <Button asChild variant="outline" className="w-full justify-start text-gray-300 border-gray-600 hover:bg-gray-700">
                  <a href={`mailto:${contact.email}`} className="flex items-center space-x-2">
                    <Mail size={18} />
                    <span>{contact.email}</span>
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactsPage;
