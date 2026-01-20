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
import { Plus, Pencil, Trash2, FileText, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { integrateIndexNow } from '../../lib/seo';

interface Article {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  content: string;
  image_url: string;
  status: string;
  created_at: string;
  views: number;
}

interface Category {
  id: string;
  name: string;
}

export const ManageArticles = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category_id: '',
    content: '',
    image_url: '',
    status: 'published'
  });

  const fetchData = async () => {
    try {
      const [articlesData, catsData] = await Promise.all([
        blink.db.articles.list({ orderBy: { created_at: 'desc' } }),
        blink.db.categories.list({ where: { type: 'article' } })
      ]);
      setArticles(articlesData as Article[]);
      setCategories(catsData as Category[]);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.title || !formData.slug || !formData.category_id || !formData.content) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      setLoading(true);
      const dataToSave = {
        title: formData.title,
        slug: formData.slug,
        category_id: formData.category_id,
        content: formData.content,
        image_url: formData.image_url,
        status: formData.status,
        user_id: user.id
      };

      if (editingId) {
        await blink.db.articles.update(editingId, dataToSave);
        toast.success('Статья обновлена');
      } else {
        const newArt = await blink.db.articles.create(dataToSave);
        toast.success('Статья создана');
        // Notify IndexNow for SEO
        integrateIndexNow(`${window.location.origin}/articles/${dataToSave.slug}`);
      }
      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Ошибка при сохранении: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (art: Article) => {
    setEditingId(art.id);
    setFormData({
      title: art.title,
      slug: art.slug,
      category_id: art.category_id,
      content: art.content,
      image_url: art.image_url || '',
      status: art.status
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены?')) return;
    try {
      await blink.db.articles.delete(id);
      toast.success('Статья удалена');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ 
      title: '', 
      slug: '', 
      category_id: '', 
      content: '', 
      image_url: '', 
      status: 'published' 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Управление статьями</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Написать статью
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать' : 'Создать'} статью</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Заголовок</label>
                <Input 
                  placeholder="Как выбрать кредитную карту" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug (URL)</label>
                <Input 
                  placeholder="how-to-choose-card" 
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Категория</label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Статус</label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Опубликовано</SelectItem>
                    <SelectItem value="draft">Черновик</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">URL изображения</label>
                <Input 
                  placeholder="https://image.com/article.jpg" 
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Содержание</label>
                <Textarea 
                  placeholder="Текст статьи..." 
                  className="min-h-[300px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleSubmit}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-muted/10 rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Заголовок</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Просмотры</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell></TableRow>
            ) : articles.length > 0 ? (
              articles.map((art) => (
                <TableRow key={art.id}>
                  <TableCell className="font-medium max-w-[300px] truncate">
                    {art.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {categories.find(c => c.id === art.category_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(art.created_at), 'dd.MM.yyyy', { locale: ru })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                      {art.views || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(art)}>
                        <Pencil className="w-4 h-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(art.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">Статей не найдено</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
