import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blink } from '../../lib/blink';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MessageSquare, User, Clock, Eye, Plus, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'react-hot-toast';
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
  author_id: string;
  views: number;
  created_at: string;
}

export const ForumTopicsPage = () => {
  const { id: categoryId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // New topic state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTopics = async () => {
    try {
      const [topicsData, catData] = await Promise.all([
        blink.db.forumTopics.list({ where: { category_id: categoryId }, orderBy: { created_at: 'desc' } }),
        blink.db.categories.get(categoryId!)
      ]);
      setTopics(topicsData as Topic[]);
      setCategory(catData);
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, [categoryId]);

  const handleCreateTopic = async () => {
    if (!user) return navigate('/login');
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const topic = await blink.db.forumTopics.create({
        title: newTitle,
        category_id: categoryId,
        author_id: user.id,
        user_id: user.id // For RLS
      });

      await blink.db.forumPosts.create({
        topic_id: topic.id,
        content: newContent,
        author_id: user.id,
        user_id: user.id
      });

      toast.success('Тема создана!');
      setNewTitle('');
      setNewContent('');
      setIsDialogOpen(false);
      fetchTopics();
    } catch (error) {
      toast.error('Ошибка при создании темы');
    }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-12 animate-pulse space-y-4">
      <div className="h-10 w-64 bg-muted rounded" />
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded-xl" />
        ))}
      </div>
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
              <BreadcrumbPage>{category?.name || 'Загрузка...'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <Link to="/forum" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary gap-1 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Назад к разделам
            </Link>
            <h1 className="text-3xl font-bold">{category?.name}</h1>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-105">
                <Plus className="w-4 h-4" />
                Новая тема
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Создать новую тему</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Заголовок</label>
                  <Input 
                    placeholder="О чем хотите поговорить?" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ваше сообщение</label>
                  <Textarea 
                    placeholder="Опишите ваш вопрос или предложение..." 
                    className="min-h-[150px]"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleCreateTopic} disabled={!newTitle || !newContent}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-background rounded-3xl border shadow-sm overflow-hidden divide-y">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <Link 
                key={topic.id} 
                to={`/forum/topic/${topic.id}`}
                className="block p-6 hover:bg-muted/30 transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {topic.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary/60" />
                        Пользователь
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary/60" />
                        {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: ru })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-bold text-foreground">{topic.views || 0}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">Просмотров</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <MessageSquare className="w-4 h-4 mb-1 text-primary/40" />
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-50">Ответов</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="font-medium italic">В этом разделе пока нет тем. Станьте первым!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
