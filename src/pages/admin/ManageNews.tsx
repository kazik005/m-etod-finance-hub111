import React, { useEffect, useState } from 'react';
import { blink } from '../../lib/blink';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
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
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Newspaper, 
  Eye, 
  Loader2, 
  Wand2, 
  Globe, 
  Link2, 
  RefreshCcw, 
  Save,
  ExternalLink,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Switch } from '../../components/ui/switch';

interface News {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  source_url: string;
  category_id: string;
  views: number;
  status: string;
  is_featured: number;
  meta_title: string;
  meta_description: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface ParsedNews {
  title: string;
  url: string;
  content?: string;
  rewrittenContent?: string;
}

export const ManageNews = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image_url: '',
    source_url: '',
    category_id: '',
    status: 'published',
    is_featured: false,
    meta_title: '',
    meta_description: ''
  });

  // Parser state
  const [parsedItems, setParsedItems] = useState<ParsedNews[]>([]);
  const [customUrl, setCustomUrl] = useState('');
  const [parsingUrl, setParsingUrl] = useState(false);
  const [parsingBanki, setParsingBanki] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [selectedParserCategory, setSelectedParserCategory] = useState('');

  const fetchData = async () => {
    try {
      const [newsData, catsData] = await Promise.all([
        blink.db.news.list({ orderBy: { created_at: 'desc' } }),
        blink.db.categories.list({ where: { type: 'news' } })
      ]);
      setNews(newsData as News[]);
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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-яё\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60);
  };

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
        content: formData.content,
        excerpt: formData.excerpt || formData.content.slice(0, 200),
        image_url: formData.image_url,
        source_url: formData.source_url,
        category_id: formData.category_id,
        status: formData.status,
        is_featured: formData.is_featured ? 1 : 0,
        meta_title: formData.meta_title || formData.title,
        meta_description: formData.meta_description || formData.excerpt || formData.content.slice(0, 160),
        user_id: user.id
      };

      if (editingId) {
        await blink.db.news.update(editingId, dataToSave);
        toast.success('Новость обновлена');
      } else {
        await blink.db.news.create(dataToSave);
        toast.success('Новость опубликована');
      }
      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Ошибка: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: News) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      slug: item.slug,
      content: item.content,
      excerpt: item.excerpt || '',
      image_url: item.image_url || '',
      source_url: item.source_url || '',
      category_id: item.category_id,
      status: item.status,
      is_featured: Number(item.is_featured) === 1,
      meta_title: item.meta_title || '',
      meta_description: item.meta_description || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Удалить эту новость?')) return;
    try {
      await blink.db.news.delete(id);
      toast.success('Новость удалена');
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
      content: '', 
      excerpt: '',
      image_url: '', 
      source_url: '',
      category_id: '', 
      status: 'published',
      is_featured: false,
      meta_title: '',
      meta_description: ''
    });
  };

  // Parser functions
  const parseFromUrl = async () => {
    if (!customUrl.trim()) {
      toast.error('Введите URL');
      return;
    }

    setParsingUrl(true);
    try {
      const { markdown, metadata } = await blink.data.scrape(customUrl);
      
      const newItem: ParsedNews = {
        title: metadata?.title || 'Без названия',
        url: customUrl,
        content: markdown.slice(0, 5000)
      };

      setParsedItems(prev => [newItem, ...prev]);
      setCustomUrl('');
      toast.success('Страница спарсена');
    } catch (error) {
      toast.error('Ошибка парсинга');
    } finally {
      setParsingUrl(false);
    }
  };

  const parseFromBanki = async () => {
    setParsingBanki(true);
    try {
      const { links } = await blink.data.scrape('https://www.banki.ru/news/');
      
      const items: ParsedNews[] = links
        .filter(l => l.url.includes('/news/daytheme/') || l.url.includes('/news/lenta/'))
        .slice(0, 5)
        .map(l => ({
          title: l.text || 'Новость',
          url: l.url.startsWith('http') ? l.url : `https://www.banki.ru${l.url}`
        }));

      setParsedItems(prev => [...items, ...prev]);
      toast.success(`Загружено ${items.length} новостей`);
    } catch (error) {
      toast.error('Ошибка парсинга');
    } finally {
      setParsingBanki(false);
    }
  };

  const rewriteItem = async (index: number) => {
    const item = parsedItems[index];
    setRewriting(item.url);
    try {
      const { markdown } = await blink.data.scrape(item.url);
      
      const { text } = await blink.ai.generateText({
        prompt: `Перепиши следующую новость для финансового портала. Сделай текст уникальным, сохрани факты. Отвечай на русском языке:\n\n${markdown.slice(0, 4000)}`,
      });

      const lines = text.split('\n');
      const newTitle = lines[0].replace(/^#+\s*/, '').replace(/\*+/g, '').trim();
      const newContent = lines.slice(1).join('\n').trim();

      const updated = [...parsedItems];
      updated[index] = {
        ...item,
        title: newTitle || item.title,
        rewrittenContent: newContent
      };
      setParsedItems(updated);
      toast.success('Текст уникализирован');
    } catch (error) {
      toast.error('Ошибка AI');
    } finally {
      setRewriting(null);
    }
  };

  const saveAsNews = async (index: number) => {
    if (!user || !selectedParserCategory) {
      toast.error('Выберите категорию');
      return;
    }

    const item = parsedItems[index];
    if (!item.rewrittenContent) {
      toast.error('Сначала выполните рерайт');
      return;
    }

    try {
      const slug = generateSlug(item.title) + '-' + Date.now().toString().slice(-4);

      await blink.db.news.create({
        title: item.title,
        slug,
        content: item.rewrittenContent,
        excerpt: item.rewrittenContent.slice(0, 200),
        source_url: item.url,
        category_id: selectedParserCategory,
        status: 'published',
        user_id: user.id
      });

      toast.success('Новость опубликована');
      setParsedItems(parsedItems.filter((_, i) => i !== index));
      fetchData();
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Управление новостями</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Добавить новость
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать' : 'Создать'} новость</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Заголовок *</label>
                <Input 
                  placeholder="Заголовок новости" 
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: generateSlug(e.target.value)
                    });
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug (URL)</label>
                <Input 
                  placeholder="news-slug" 
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Категория *</label>
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
                  placeholder="https://example.com/image.jpg" 
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Источник (URL)</label>
                <Input 
                  placeholder="https://source.com/article" 
                  value={formData.source_url}
                  onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Краткое описание</label>
                <Textarea 
                  placeholder="Краткое описание для превью..." 
                  className="min-h-[80px]"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Содержание *</label>
                <Textarea 
                  placeholder="Текст новости..." 
                  className="min-h-[250px]"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="col-span-2 flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <Switch 
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <div>
                  <label className="text-sm font-medium">Главная новость</label>
                  <p className="text-xs text-muted-foreground">Отображается в блоке "Главные новости"</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Title</label>
                <Input 
                  placeholder="Meta title для поисковиков" 
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SEO Description</label>
                <Input 
                  placeholder="Meta description" 
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
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

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">Список новостей</TabsTrigger>
          <TabsTrigger value="parser">Парсер</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="bg-muted/10 rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Заголовок</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Просмотры</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Загрузка...</TableCell></TableRow>
                ) : news.length > 0 ? (
                  news.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium max-w-[300px]">
                        <div className="flex items-center gap-2">
                          {Number(item.is_featured) === 1 && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {categories.find(c => c.id === item.category_id)?.name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {format(new Date(item.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          {item.views || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                          {item.status === 'published' ? 'Опубл.' : 'Черновик'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                            <Pencil className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                      Новостей не найдено
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="parser" className="mt-6 space-y-6">
          {/* Custom URL Parser */}
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                Парсинг по ссылке
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Вставьте URL статьи..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={parseFromUrl} disabled={parsingUrl} className="gap-2 shrink-0">
                  {parsingUrl ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="w-4 h-4" />
                  )}
                  Спарсить
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="outline" size="sm" onClick={parseFromBanki} disabled={parsingBanki} className="gap-2">
                  {parsingBanki ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
                  Banki.ru
                </Button>
                <span className="text-xs text-muted-foreground">или вставьте ссылку на любую статью</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Selector */}
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <label className="text-sm font-medium mb-1.5 block">Категория для импорта</label>
              <Select value={selectedParserCategory} onValueChange={setSelectedParserCategory}>
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
            <Badge variant="outline" className="text-xs mt-5">AI Enabled</Badge>
          </div>

          {/* Parsed Items */}
          {parsedItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {parsedItems.map((item, index) => (
                <Card key={item.url} className="border-none bg-muted/20 shadow-sm overflow-hidden group">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 space-y-1">
                        <h3 className="font-bold leading-tight group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary"
                        >
                          Источник <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          disabled={rewriting === item.url}
                          onClick={() => rewriteItem(index)}
                        >
                          {rewriting === item.url ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Wand2 className="w-3.5 h-3.5" />
                          )}
                          AI Рерайт
                        </Button>
                        <Button 
                          size="sm" 
                          className="gap-2"
                          disabled={!item.rewrittenContent}
                          onClick={() => saveAsNews(index)}
                        >
                          <Save className="w-3.5 h-3.5" />
                          Опубликовать
                        </Button>
                      </div>
                    </div>
                    {item.rewrittenContent && (
                      <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2">
                        <p className="text-sm text-muted-foreground line-clamp-3 italic">
                          {item.rewrittenContent}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-background/50 rounded-xl border border-dashed">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto opacity-20 mb-3" />
              <p className="text-muted-foreground text-sm">
                Используйте кнопки выше для парсинга новостей
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
