import React, { useState, useEffect } from 'react';
import { blink } from '../../lib/blink';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Map, 
  RefreshCcw, 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  FileText,
  Globe,
  Loader2,
  ExternalLink,
  Calendar,
  Link2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  title?: string;
}

export const ManageSitemap = () => {
  const [loading, setLoading] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [entries, setEntries] = useState<SitemapEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Set default base URL
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const generateSitemap = async () => {
    setLoading(true);
    const sitemapEntries: SitemapEntry[] = [];
    
    try {
      // Static pages
      const staticPages = [
        { url: '/', title: 'Главная', priority: 1.0, changefreq: 'daily' as const },
        { url: '/offers', title: 'Офферы', priority: 0.9, changefreq: 'daily' as const },
        { url: '/articles', title: 'Статьи', priority: 0.9, changefreq: 'daily' as const },
        { url: '/news', title: 'Новости', priority: 0.9, changefreq: 'hourly' as const },
        { url: '/forum', title: 'Форум', priority: 0.8, changefreq: 'hourly' as const },
        { url: '/rates', title: 'Курсы валют', priority: 0.7, changefreq: 'daily' as const },
      ];

      staticPages.forEach(page => {
        sitemapEntries.push({
          url: `${baseUrl}${page.url}`,
          lastmod: new Date().toISOString(),
          changefreq: page.changefreq,
          priority: page.priority,
          title: page.title
        });
      });

      // Fetch dynamic content
      const [articles, news, categories, offers] = await Promise.all([
        blink.db.articles.list({ where: { status: 'published' }, orderBy: { created_at: 'desc' } }),
        blink.db.news.list({ where: { status: 'published' }, orderBy: { created_at: 'desc' } }),
        blink.db.categories.list({}),
        blink.db.offers.list({ where: { status: 'published' } })
      ]);

      // Articles
      (articles as any[]).forEach(article => {
        sitemapEntries.push({
          url: `${baseUrl}/articles/${article.slug}`,
          lastmod: article.created_at || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
          title: article.title
        });
      });

      // News
      (news as any[]).forEach(item => {
        sitemapEntries.push({
          url: `${baseUrl}/news/${item.slug}`,
          lastmod: item.created_at || new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
          title: item.title
        });
      });

      // Category pages for forum
      const forumCategories = (categories as any[]).filter(c => c.type === 'forum');
      forumCategories.forEach(cat => {
        sitemapEntries.push({
          url: `${baseUrl}/forum/category/${cat.slug}`,
          lastmod: cat.created_at || new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.6,
          title: `Форум: ${cat.name}`
        });
      });

      setEntries(sitemapEntries);

      // Generate XML
      const xml = generateXML(sitemapEntries);
      setXmlContent(xml);

      // Generate HTML
      const html = generateHTML(sitemapEntries);
      setHtmlContent(html);

      toast.success(`Карта сайта создана: ${sitemapEntries.length} страниц`);
    } catch (error) {
      console.error('Sitemap generation error:', error);
      toast.error('Ошибка генерации карты сайта');
    } finally {
      setLoading(false);
    }
  };

  const generateXML = (entries: SitemapEntry[]): string => {
    const urls = entries.map(entry => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastmod.split('T')[0]}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  };

  const generateHTML = (entries: SitemapEntry[]): string => {
    const groupedEntries: Record<string, SitemapEntry[]> = {};
    
    entries.forEach(entry => {
      const path = new URL(entry.url).pathname;
      let category = 'Главные страницы';
      
      if (path.startsWith('/articles/')) category = 'Статьи';
      else if (path.startsWith('/news/')) category = 'Новости';
      else if (path.startsWith('/forum/')) category = 'Форум';
      else if (path.startsWith('/offers')) category = 'Офферы';
      
      if (!groupedEntries[category]) groupedEntries[category] = [];
      groupedEntries[category].push(entry);
    });

    let html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Карта сайта - M-etod Finance Hub</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; background: #fafafa; }
    h1 { color: #18181b; margin-bottom: 2rem; }
    h2 { color: #3f3f46; margin: 2rem 0 1rem; border-bottom: 2px solid #e4e4e7; padding-bottom: 0.5rem; }
    ul { list-style: none; padding: 0; }
    li { margin: 0.5rem 0; }
    a { color: #6366f1; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .date { color: #71717a; font-size: 0.875rem; margin-left: 1rem; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e4e4e7; color: #71717a; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>🗺️ Карта сайта</h1>
  <p>Всего страниц: ${entries.length}</p>
`;

    Object.entries(groupedEntries).forEach(([category, items]) => {
      html += `\n  <h2>${category}</h2>\n  <ul>\n`;
      items.forEach(item => {
        const date = item.lastmod ? format(new Date(item.lastmod), 'dd.MM.yyyy') : '';
        html += `    <li><a href="${item.url}">${item.title || item.url}</a><span class="date">${date}</span></li>\n`;
      });
      html += `  </ul>\n`;
    });

    html += `
  <div class="footer">
    <p>Обновлено: ${format(new Date(), 'dd.MM.yyyy HH:mm')}</p>
    <p>M-etod Finance Hub © ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;

    return html;
  };

  const escapeXml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Скопировано в буфер обмена');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Ошибка копирования');
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Файл ${filename} скачан`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Map className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Карта сайта</h1>
            <p className="text-sm text-muted-foreground">Генерация XML и HTML карт сайта для SEO</p>
          </div>
        </div>
        <Button onClick={generateSitemap} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
          Сгенерировать
        </Button>
      </div>

      {/* Base URL Setting */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Базовый URL сайта
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Используется как префикс для всех URL в карте сайта
          </p>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{entries.length}</div>
                <p className="text-sm text-muted-foreground">Всего страниц</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {entries.filter(e => e.url.includes('/articles/')).length}
                </div>
                <p className="text-sm text-muted-foreground">Статей</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {entries.filter(e => e.url.includes('/news/')).length}
                </div>
                <p className="text-sm text-muted-foreground">Новостей</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">
                  {entries.filter(e => e.url.includes('/forum/')).length}
                </div>
                <p className="text-sm text-muted-foreground">Страниц форума</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for XML and HTML */}
          <Tabs defaultValue="xml" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="xml" className="gap-2">
                <FileCode className="w-4 h-4" />
                XML
              </TabsTrigger>
              <TabsTrigger value="html" className="gap-2">
                <FileText className="w-4 h-4" />
                HTML
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <Link2 className="w-4 h-4" />
                Список
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xml" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">sitemap.xml</h3>
                  <p className="text-sm text-muted-foreground">
                    Для поисковых систем (Google, Yandex, Bing)
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(xmlContent)}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadFile(xmlContent, 'sitemap.xml', 'application/xml')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={xmlContent}
                readOnly
                className="min-h-[400px] font-mono text-xs"
              />
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-sm">
                    <strong>Инструкция:</strong> Загрузите файл <code>sitemap.xml</code> в корень вашего сайта 
                    и добавьте его в Google Search Console и Яндекс.Вебмастер.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="html" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold">sitemap.html</h3>
                  <p className="text-sm text-muted-foreground">
                    Для пользователей и улучшения навигации
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(htmlContent)}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => downloadFile(htmlContent, 'sitemap.html', 'text/html')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={htmlContent}
                readOnly
                className="min-h-[400px] font-mono text-xs"
              />
            </TabsContent>

            <TabsContent value="list" className="mt-6">
              <div className="bg-muted/10 rounded-2xl border overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3">URL</th>
                        <th className="text-left p-3 w-32">Приоритет</th>
                        <th className="text-left p-3 w-32">Частота</th>
                        <th className="text-left p-3 w-32">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3">
                            <a 
                              href={entry.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {entry.title || entry.url}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="p-3">
                            <Badge variant={entry.priority >= 0.8 ? 'default' : 'secondary'}>
                              {entry.priority.toFixed(1)}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{entry.changefreq}</td>
                          <td className="p-3 text-muted-foreground text-xs">
                            {format(new Date(entry.lastmod), 'dd.MM.yy')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {entries.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Map className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Карта сайта не создана</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Нажмите кнопку "Сгенерировать" для создания XML и HTML карт сайта
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
