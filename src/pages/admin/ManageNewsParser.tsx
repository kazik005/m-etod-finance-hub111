import React, { useState, useEffect } from 'react';
import { blink } from '../../lib/blink';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Newspaper, RefreshCcw, Save, Loader2, Wand2, ExternalLink, Link2, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface ParsedNews {
  title: string;
  url: string;
  date: string;
  description?: string;
  content?: string;
  rewrittenContent?: string;
}

export const ManageNewsParser = () => {
  const { user } = useAuth();
  const [news, setNews] = useState<ParsedNews[]>([]);
  const [loading, setLoading] = useState(false);
  const [rewriting, setRewriting] = useState<string | null>(null);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [parsingCustom, setParsingCustom] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      const data = await blink.db.categories.list({ where: { type: 'article' } });
      setCategories(data as any[]);
    };
    fetchCats();
  }, []);

  // Parse from custom URL
  const parseFromUrl = async () => {
    if (!customUrl.trim()) {
      toast.error('Введите URL для парсинга');
      return;
    }

    setParsingCustom(true);
    try {
      const { markdown, links, metadata } = await blink.data.scrape(customUrl);
      
      // Extract title and content from scraped page
      const title = metadata?.title || 'Без названия';
      const description = metadata?.description || markdown.slice(0, 200);
      
      const newItem: ParsedNews = {
        title,
        url: customUrl,
        date: new Date().toISOString(),
        description,
        content: markdown.slice(0, 5000)
      };

      setNews(prev => [newItem, ...prev]);
      setCustomUrl('');
      toast.success('Страница успешно спарсена');
    } catch (error) {
      toast.error('Ошибка при парсинге URL');
      console.error(error);
    } finally {
      setParsingCustom(false);
    }
  };

  const parseNews = async () => {
    setLoading(true);
    try {
      // Use blink.data.scrape to get news from banki.ru
      const { markdown, links } = await blink.data.scrape('https://www.banki.ru/news/');
      
      // In a real scenario, we would parse the markdown/links more precisely.
      // For MVP, we'll simulate parsing 5 latest items from the scraped data
      const items: ParsedNews[] = links
        .filter(l => l.url.includes('/news/daytheme/') || l.url.includes('/news/lenta/'))
        .slice(0, 5)
        .map(l => ({
          title: l.text || 'Новости экономики',
          url: l.url.startsWith('http') ? l.url : `https://www.banki.ru${l.url}`,
          date: new Date().toISOString(),
          description: 'Новость с портала banki.ru'
        }));

      setNews(prev => [...items, ...prev]);
      toast.success('Новости успешно загружены');
    } catch (error) {
      toast.error('Ошибка при парсинге новостей');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const rewriteNews = async (index: number) => {
    const item = news[index];
    setRewriting(item.url);
    try {
      // 1. Get full content of the news
      const { markdown } = await blink.data.scrape(item.url);
      
      // 2. Use AI to unique-ify and rewrite in Russian
      const { text } = await blink.ai.generateText({
        messages: [
          {
            role: 'system',
            content: "Ты - профессиональный финансовый журналист. Твоя задача - переписать новость, сделав ее уникальной, интересной и сохранив при этом все факты. Пиши на русском языке."
          },
          {
            role: 'user',
            content: `Перепиши следующую новость для нашего финансового хаба. Сделай заголовок и содержание уникальными:\n\n${markdown.slice(0, 4000)}`
          }
        ],
        maxTokens: 3000,
      });

      const lines = text.split('\n');
      const newTitle = lines[0].replace('Заголовок:', '').replace('**', '').trim();
      const newContent = lines.slice(1).join('\n').trim();

      const updatedNews = [...news];
      updatedNews[index] = {
        ...item,
        title: newTitle,
        rewrittenContent: newContent
      };
      setNews(updatedNews);
      toast.success('Новость успешно уникализирована');
    } catch (error) {
      toast.error('Ошибка при работе нейросети');
      console.error(error);
    } finally {
      setRewriting(null);
    }
  };

  const saveToArticles = async (index: number) => {
    if (!user || !selectedCategory) {
      toast.error('Выберите категорию для сохранения');
      return;
    }

    const item = news[index];
    if (!item.rewrittenContent) {
      toast.error('Сначала выполните рерайт новости');
      return;
    }

    try {
      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9а-я]+/g, '-')
        .replace(/^-+|-+$/g, '');

      await blink.db.articles.create({
        title: item.title,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        content: item.rewrittenContent,
        category_id: selectedCategory,
        status: 'published',
        user_id: user.id,
        created_at: new Date().toISOString()
      });

      toast.success('Новость сохранена как статья');
      // Remove from list after saving
      setNews(news.filter((_, i) => i !== index));
    } catch (error) {
      toast.error('Ошибка при сохранении статьи');
      console.error(error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Парсер статей</h1>
        </div>
        <Button onClick={parseNews} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          Banki.ru
        </Button>
      </div>

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
              placeholder="Вставьте URL статьи (например: https://rbc.ru/article/...)"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={parseFromUrl} disabled={parsingCustom} className="gap-2 shrink-0">
              {parsingCustom ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCcw className="w-4 h-4" />
              )}
              Спарсить
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Поддерживаются любые новостные сайты: РБК, Ведомости, Коммерсант, Banki.ru и другие
          </p>
        </CardContent>
      </Card>

      <div className="bg-muted/10 border rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">Категория для импорта</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
          <div className="pt-6">
            <Badge variant="outline" className="text-xs">AI Enabled</Badge>
          </div>
        </div>

        {news.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {news.map((item, index) => (
              <Card key={item.url} className="border-none bg-background shadow-sm overflow-hidden group">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-bold leading-tight group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                          Источник: banki.ru <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        disabled={rewriting === item.url}
                        onClick={() => rewriteNews(index)}
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
                        onClick={() => saveToArticles(index)}
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
            <div className="max-w-xs mx-auto space-y-3">
              <Newspaper className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
              <p className="text-muted-foreground text-sm">
                Нажмите кнопку выше, чтобы загрузить последние финансовые новости для обработки.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
