import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { blink } from '../../lib/blink';
import { MessageSquare, ArrowRight, User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ForumTopic {
  id: string;
  title: string;
  created_at: string;
  author_id: string;
}

export const ForumFeedWidget = () => {
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await blink.db.forumTopics.list({
          limit: 5,
          orderBy: { created_at: 'desc' }
        });
        setTopics(data as ForumTopic[]);
      } catch (error) {
        console.error('Failed to fetch topics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) return (
    <Card className="animate-pulse bg-muted/50 border-none">
      <div className="h-[300px]" />
    </Card>
  );

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Новое на форуме
        </CardTitle>
        <Link to="/forum" className="text-sm text-primary hover:underline flex items-center gap-1">
          Все темы
          <ArrowRight className="w-4 h-4" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/50">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <Link 
                key={topic.id} 
                to={`/forum/topic/${topic.id}`}
                className="block py-4 hover:bg-muted/30 transition-colors -mx-6 px-6"
              >
                <h4 className="font-semibold text-sm mb-2 line-clamp-1 group-hover:text-primary">
                  {topic.title}
                </h4>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Пользователь
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {topic.created_at ? (
                      formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: ru })
                    ) : (
                      'недавно'
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm italic">Пока нет новых тем</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
