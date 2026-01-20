import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { blink } from '../lib/blink';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Newspaper, Calendar, Eye, ArrowRight, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

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
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const NewsPage = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsData, catsData] = await Promise.all([
          blink.db.news.list({
            where: { status: 'published' },
            orderBy: { created_at: 'desc' },
            limit: 50
          }),
          blink.db.categories.list({ where: { type: 'news' } })
        ]);
        setNews(newsData as News[]);
        setCategories(catsData as Category[]);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredNews = filteredNews.filter(n => Number(n.is_featured) === 1);
  const regularNews = filteredNews.filter(n => Number(n.is_featured) === 0);

  const getCategoryName = (catId: string) => {
    return categories.find(c => c.id === catId)?.name || 'Без категории';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
          <Newspaper className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-primary">Новости</span>
        </div>
        <h1 className="text-4xl font-bold mb-4">Финансовые новости</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Актуальные новости из мира финансов, банковского сектора и экономики
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск новостей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse bg-muted/30 h-[300px]" />
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
          <Newspaper className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Новости не найдены</p>
        </div>
      ) : (
        <>
          {/* Featured News */}
          {featuredNews.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                  Главные новости
                </Badge>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredNews.slice(0, 2).map(item => (
                  <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-all">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <Newspaper className="w-16 h-16 text-primary/30" />
                        </div>
                      )}
                      <Badge className="absolute top-4 left-4 bg-yellow-500">
                        Главное
                      </Badge>
                    </div>
                    <CardHeader>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(item.created_at), 'd MMMM yyyy', { locale: ru })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.views}
                        </span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">
                        {item.excerpt || item.content.slice(0, 150)}...
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link to={`/news/${item.slug}`} className="w-full">
                        <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          Читать полностью
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Regular News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularNews.map(item => (
              <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                      <Newspaper className="w-12 h-12 text-primary/20" />
                    </div>
                  )}
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryName(item.category_id)}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(item.created_at), 'dd.MM.yy', { locale: ru })}
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.excerpt || item.content.slice(0, 100)}...
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <Link to={`/news/${item.slug}`} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                    Подробнее
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
