import React, { useEffect, useState } from 'react';
import { blink } from '../lib/blink';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FileText, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  category_id: string;
  created_at: string;
  views: number;
}

interface Category {
  id: string;
  name: string;
}

export const ArticlesPage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, catsData] = await Promise.all([
          blink.db.articles.list({ where: { status: 'published' }, orderBy: { created_at: 'desc' } }),
          blink.db.categories.list({ where: { type: 'article' } })
        ]);
        setArticles(articlesData as Article[]);
        setCategories(catsData as Category[]);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Финансовый журнал</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Экспертные статьи, аналитика и советы по управлению личными финансами
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse bg-muted/50 h-[400px] border-none" />
            ))
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <Link key={article.id} to={`/articles/${article.slug}`}>
                <Card className="group h-full flex flex-col hover:shadow-2xl transition-all duration-300 border-none bg-muted/20 overflow-hidden">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    {article.image_url ? (
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary/20">
                        <FileText className="w-12 h-12" />
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-background/80 backdrop-blur-md text-foreground hover:bg-background border-none">
                      {categories.find(c => c.id === article.category_id)?.name || 'Финансы'}
                    </Badge>
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {article.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(article.created_at), 'dd MMM yyyy', { locale: ru })}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        M-etod
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold italic opacity-50">Здесь пока нет статей</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
