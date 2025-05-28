
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID, ThemeJson } from '@/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Import specific icons if needed, e.g., from lucide-react
// For example: import { Utensils, Spa, Wifi } from 'lucide-react';

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

  if (isLoading) return <div className="text-center py-10">Loading hotel information...</div>;
  if (error || !theme || !theme.hotel_info) return <div className="text-center py-10 text-red-500">Error loading hotel information or no info provided.</div>;

  // Simple parsing for icons, assuming format "emoji Title: Description"
  // Or you might have a structured 'services' array in theme_json
  const services = theme.hotel_info.split('\\n').map(line => {
    const match = line.match(/^(\p{Emoji}\s*)?(.+?)(:\s*(.*))?$/u);
    if (match) {
      return {
        icon: match[1]?.trim() || null, // Emoji icon
        title: match[2]?.trim(),
        description: match[4]?.trim() || null,
      };
    }
    return { icon: null, title: line, description: null };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Услуги отеля</h1>
      <Card className="bg-gray-800 border-gray-700 p-6">
        <CardContent className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="flex items-start space-x-3">
              {service.icon && <span className="text-2xl">{service.icon}</span>}
              <div>
                <h3 className="font-semibold text-lg text-white">{service.title}</h3>
                {service.description && <p className="text-gray-300 text-sm">{service.description}</p>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default HotelServicesPage;
