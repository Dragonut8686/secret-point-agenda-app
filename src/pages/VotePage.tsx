
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EVENT_ID } from '@/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/integrations/supabase/types';

type Work = Database['public']['Tables']['works']['Row'];

const fetchWorks = async () => {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('event_id', EVENT_ID)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Work[];
};

const incrementVoteCount = async (workId: string) => {
  // This is a client-side simulation. For actual vote counting, use an Edge Function or stored procedure.
  // Direct increment from client can be insecure and prone to race conditions.
  // For now, we just show a toast.
  // const { error } = await supabase.rpc('increment_vote', { work_id_param: workId });
  // if (error) throw new Error(error.message);
  console.log(`Voted for work: ${workId}. In a real app, this would call an RPC or Edge Function.`);
};


const VotePage = () => {
  const queryClient = useQueryClient();
  const { data: works, isLoading, error } = useQuery({
    queryKey: ['works', EVENT_ID],
    queryFn: fetchWorks
  });

  const voteMutation = useMutation({
    mutationFn: incrementVoteCount,
    onSuccess: (_, workId) => {
      toast({ title: "Успех!", description: "Ваш голос учтён!" });
      // Optimistically update or refetch. For now, just refetch.
      queryClient.invalidateQueries({ queryKey: ['works', EVENT_ID] }); 
    },
    onError: (error) => {
      toast({ title: "Ошибка!", description: `Не удалось проголосовать: ${error.message}`, variant: "destructive" });
    }
  });

  if (isLoading) return <div className="text-center py-10">Loading works for voting...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading works.</div>;
  if (!works || works.length === 0) {
    return <div className="text-center py-10">Нет работ для голосования.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-center">Голосование</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {works.map(work => (
          <Card key={work.id} className="bg-gray-800 border-gray-700 flex flex-col">
            <CardHeader>
              {work.photo_url && (
                <img src={work.photo_url} alt={work.title} className="w-full h-48 object-cover rounded-t-lg mb-4"/>
              )}
              <CardTitle className="text-white">{work.title}</CardTitle>
              <CardDescription className="text-gray-400">Автор: {work.author_name || 'Не указан'}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {work.description && <p className="text-gray-300 text-sm">{work.description}</p>}
            </CardContent>
            <CardFooter className="mt-auto">
              <Button 
                onClick={() => voteMutation.mutate(work.id)} 
                className="w-full bg-[var(--app-primary)] hover:bg-opacity-80 text-white"
                disabled={voteMutation.isPending && voteMutation.variables === work.id}
              >
                {(voteMutation.isPending && voteMutation.variables === work.id) ? 'Голосуем...' : `Голосовать (${work.votes_count || 0})`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <p className="text-xs text-center text-gray-500 mt-4">
        Примечание: Увеличение счетчика голосов здесь имитируется. Для реального подсчета голосов потребуется серверная логика (например, Supabase Edge Function).
      </p>
    </div>
  );
};

export default VotePage;
