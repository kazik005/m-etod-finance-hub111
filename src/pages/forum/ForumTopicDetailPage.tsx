import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blink } from '../../lib/blink';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { MessageSquare, User, Clock, ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'react-hot-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../components/ui/breadcrumb";

interface Topic {
  id: string;
  title: string;
  category_id: string;
  author_id: string;
  created_at: string;
  views: number;
}

interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
}

export const ForumTopicDetailPage = () => {
  const { id: topicId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [topicData, postsData] = await Promise.all([
        blink.db.forumTopics.get(topicId!),
        blink.db.forumPosts.list({ where: { topic_id: topicId }, orderBy: { created_at: 'asc' } })
      ]);
      
      if (topicData) {
        setTopic(topicData as Topic);
        setPosts(postsData as Post[]);
        
        // Fetch category
        const catData = await blink.db.categories.get(topicData.category_id);
        setCategory(catData);

        // Increment views
        await blink.db.forumTopics.update(topicId!, { views: (topicData.views || 0) + 1 });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [topicId]);

  const handleReply = async () => {
    if (!user) return navigate('/login');
    if (!newReply.trim()) return;

    setIsSubmitting(true);
    try {
      await blink.db.forumPosts.create({
        topic_id: topicId,
        content: newReply,
        author_id: user.id,
        user_id: user.id
      });

      // Update last_post_at
      await blink.db.forumTopics.update(topicId!, { last_post_at: new Date() });

      toast.success('Ответ опубликован!');
      setNewReply('');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при отправке ответа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-12 animate-pulse space-y-8">
      <div className="h-10 w-3/4 bg-muted rounded" />
      <div className="space-y-6">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );

  if (!topic) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Тема не найдена</h1>
      <Link to="/forum">
        <Button variant="outline">Вернуться на форум</Button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/forum">Форум</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/forum/category/${topic.category_id}`}>{category?.name || 'Раздел'}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{topic.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-4">
          <Link 
            to={`/forum/category/${topic.category_id}`} 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary gap-1 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Назад к списку тем
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
        </div>

        <div className="space-y-6">
          {posts.map((post, index) => (
            <Card key={post.id} className={index === 0 ? "border-primary/20 shadow-lg shadow-primary/5" : "border-none bg-muted/20"}>
              <div className="p-6 md:p-8 flex gap-6">
                <div className="hidden sm:flex flex-col items-center gap-2 w-20">
                  <Avatar className="w-12 h-12 border-2 border-background">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {post.author_id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Участник</span>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-bold text-primary">Пользователь</span>
                      <span className="text-muted-foreground/40">•</span>
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ru })}
                      </div>
                    </div>
                    {index === 0 && <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Автор темы</Badge>}
                  </div>
                  
                  <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Reply Box */}
        <div className="mt-12 pt-8 border-t space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Ваш ответ
          </h3>
          
          {user ? (
            <div className="space-y-4">
              <Textarea 
                placeholder="Что вы думаете по этому поводу?" 
                className="min-h-[150px] bg-muted/10 border-none shadow-inner focus-visible:ring-primary/20"
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleReply} 
                  disabled={!newReply.trim() || isSubmitting}
                  className="gap-2 px-8 bg-primary shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить'}
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Card className="bg-muted/30 border-none p-8 text-center">
              <p className="text-muted-foreground mb-4">Войдите в систему, чтобы оставить ответ</p>
              <Button onClick={() => navigate('/login')}>Войти</Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
