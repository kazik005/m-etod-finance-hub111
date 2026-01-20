import React, { useEffect, useState } from 'react';
import { blink } from '../../lib/blink';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../../components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { MessageSquare, Trash2, CheckCircle, Plus, FolderPlus, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

interface Topic {
  id: string;
  title: string;
  category_id: string;
  is_approved: number;
  is_pinned: number;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  is_approved: number;
  created_at: string;
  topic_id: string;
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export const ManageForum = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isTopicDialogOpen, setIsTopicDialogOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', description: '' });
  const [topicForm, setTopicForm] = useState({ title: '', category_id: '', content: '' });

  const fetchData = async () => {
    try {
      const [topicsData, postsData, catsData] = await Promise.all([
        blink.db.forumTopics.list({ orderBy: { created_at: 'desc' } }),
        blink.db.forumPosts.list({ orderBy: { created_at: 'desc' } }),
        blink.db.categories.list({ where: { type: 'forum' } })
      ]);
      setTopics(topicsData as Topic[]);
      setPosts(postsData as Post[]);
      setForumCategories(catsData as ForumCategory[]);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category CRUD
  const handleSaveCategory = async () => {
    if (!user || !categoryForm.name || !categoryForm.slug) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      const dataToSave = {
        name: categoryForm.name,
        slug: categoryForm.slug,
        description: categoryForm.description,
        type: 'forum',
        user_id: user.id
      };

      if (editingCategoryId) {
        await blink.db.categories.update(editingCategoryId, dataToSave);
        toast.success('Категория обновлена');
      } else {
        await blink.db.categories.create(dataToSave);
        toast.success('Категория создана');
      }
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
      await fetchData();
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    }
  };

  const handleEditCategory = (cat: ForumCategory) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Удалить категорию?')) return;
    try {
      await blink.db.categories.delete(id);
      toast.success('Категория удалена');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', slug: '', description: '' });
  };

  // Topic CRUD
  const handleSaveTopic = async () => {
    if (!user || !topicForm.title || !topicForm.category_id) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      const dataToSave = {
        title: topicForm.title,
        category_id: topicForm.category_id,
        author_id: user.id,
        is_approved: "1",
        user_id: user.id
      };

      if (editingTopicId) {
        await blink.db.forumTopics.update(editingTopicId, dataToSave);
        toast.success('Тема обновлена');
      } else {
        const newTopic = await blink.db.forumTopics.create(dataToSave);
        // Create first post if content provided
        if (topicForm.content.trim()) {
          await blink.db.forumPosts.create({
            topic_id: (newTopic as any).id,
            content: topicForm.content,
            author_id: user.id,
            is_approved: "1",
            user_id: user.id
          });
        }
        toast.success('Тема создана');
      }
      setIsTopicDialogOpen(false);
      resetTopicForm();
      await fetchData();
    } catch (error: any) {
      toast.error('Ошибка: ' + error.message);
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setTopicForm({ title: topic.title, category_id: topic.category_id, content: '' });
    setIsTopicDialogOpen(true);
  };

  const resetTopicForm = () => {
    setEditingTopicId(null);
    setTopicForm({ title: '', category_id: '', content: '' });
  };

  const handleApproveTopic = async (id: string) => {
    try {
      await blink.db.forumTopics.update(id, { is_approved: "1" });
      toast.success('Тема одобрена');
      fetchData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!window.confirm('Это удалит тему и все сообщения в ней. Продолжить?')) return;
    try {
      await blink.db.forumTopics.delete(id);
      toast.success('Тема удалена');
      fetchData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleApprovePost = async (id: string) => {
    try {
      await blink.db.forumPosts.update(id, { is_approved: "1" });
      toast.success('Сообщение одобрено');
      fetchData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Удалить сообщение?')) return;
    try {
      await blink.db.forumPosts.delete(id);
      toast.success('Сообщение удалено');
      fetchData();
    } catch (error) {
      toast.error('Ошибка');
    }
  };

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Управление форумом</h1>
        </div>
        <div className="flex gap-2">
          {/* Add Category Dialog */}
          <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
            setIsCategoryDialogOpen(open);
            if (!open) resetCategoryForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FolderPlus className="w-4 h-4" />
                Категория
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategoryId ? 'Редактировать' : 'Новая'} категория форума</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Название</label>
                    <Input 
                      placeholder="Кредиты" 
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Slug (URL)</label>
                    <Input 
                      placeholder="credits" 
                      value={categoryForm.slug}
                      onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Описание</label>
                  <Textarea 
                    placeholder="О чем эта категория?" 
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleSaveCategory}>Сохранить</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Topic Dialog */}
          <Dialog open={isTopicDialogOpen} onOpenChange={(open) => {
            setIsTopicDialogOpen(open);
            if (!open) resetTopicForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Тема
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingTopicId ? 'Редактировать' : 'Новая'} тема</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Заголовок темы</label>
                  <Input 
                    placeholder="Как получить кредит с плохой историей?" 
                    value={topicForm.title}
                    onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Категория</label>
                  <Select 
                    value={topicForm.category_id} 
                    onValueChange={(val) => setTopicForm({ ...topicForm, category_id: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {forumCategories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!editingTopicId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Первое сообщение (опционально)</label>
                    <Textarea 
                      placeholder="Текст первого сообщения в теме..." 
                      className="min-h-[150px]"
                      value={topicForm.content}
                      onChange={(e) => setTopicForm({ ...topicForm, content: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTopicDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleSaveTopic}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="categories" className="rounded-lg px-8">Категории</TabsTrigger>
          <TabsTrigger value="topics" className="rounded-lg px-8">Темы</TabsTrigger>
          <TabsTrigger value="posts" className="rounded-lg px-8">Сообщения</TabsTrigger>
        </TabsList>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="bg-muted/10 rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Загрузка...</TableCell></TableRow>
                ) : forumCategories.length > 0 ? (
                  forumCategories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">{cat.description || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditCategory(cat)}>
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">Категорий не найдено</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="topics">
          <div className="bg-muted/10 rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell></TableRow>
                ) : topics.length > 0 ? (
                  topics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {forumCategories.find(c => c.id === topic.category_id)?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(topic.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        {Number(topic.is_approved) > 0 ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none">Одобрено</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-none">Ожидает</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditTopic(topic)}>
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          {Number(topic.is_approved) === 0 && (
                            <Button variant="ghost" size="icon" onClick={() => handleApproveTopic(topic.id)}>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTopic(topic.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">Тем не найдено</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="posts">
          <div className="bg-muted/10 rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Содержание</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Загрузка...</TableCell></TableRow>
                ) : posts.length > 0 ? (
                  posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium max-w-[400px] truncate">
                        {post.content}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(post.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        {Number(post.is_approved) > 0 ? (
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-none">Одобрено</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-none">Ожидает</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {Number(post.is_approved) === 0 && (
                            <Button variant="ghost" size="icon" onClick={() => handleApprovePost(post.id)}>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">Сообщений не найдено</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
