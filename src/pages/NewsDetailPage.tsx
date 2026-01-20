import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blink } from '../lib/blink';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Calendar, Eye, Share2, Newspaper, ExternalLink, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { SEOHead } from '../components/seo/SEOHead';

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
  meta_title: string;
  meta_description: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface RelatedNews {
  id: string;
  title: string;
  slug: string;
  image_url: string;
  created_at: string;
}

export const NewsDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<News | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await blink.db.news.list({
          where: { slug },
          limit: 1
        });
        
        if (data.length > 0) {
          const newsItem = data[0] as News;
          setNews(newsItem);
          
          // Increment views
          await blink.db.news.update(newsItem.id, {
            views: (newsItem.views || 0) + 1
          });
          
          // Fetch category
          if (newsItem.category_id) {
            const catData = await blink.db.categories.get(newsItem.category_id);
            setCategory(catData as Category);
          }
          
          // Fetch related news
          const related = await blink.db.news.list({
            where: { 
              status: 'published',
              category_id: newsItem.category_id 
            },
            limit: 4,
            orderBy: { created_at: 'desc' }
          });
          setRelatedNews(related.filter(n => n.id !== newsItem.id).slice(0, 3) as RelatedNews[]);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchNews();
    }
  }, [slug]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news?.title,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Ссылка скопирована');
    }
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-12 bg-muted rounded w-3/4" />
          <div className="aspect-video bg-muted rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Newspaper className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Новость не найдена</h1>
        <p className="text-muted-foreground mb-8">
          Возможно, она была удалена или перемещена
        </p>
        <Link to="/news">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все новости
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={news.meta_title || news.title}
        description={news.meta_description || news.excerpt || news.content.slice(0, 160)}
        image={news.image_url}
        type="article"
        publishedTime={news.created_at}
      />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link to="/news" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Все новости
          </Link>
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              {category && (
                <Badge variant="secondary">{category.name}</Badge>
              )}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(news.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              {news.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {news.views} просмотров
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {estimateReadTime(news.content)} мин. чтения
              </span>
              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                <Share2 className="w-4 h-4 mr-2" />
                Поделиться
              </Button>
            </div>
          </div>
          
          {/* Image */}
          {news.image_url && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8 bg-muted">
              <img
                src={news.image_url}
                alt={news.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
            {news.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-4 leading-relaxed text-foreground/90">{line}</p>;
            })}
          </div>
          
          {/* Source */}
          {news.source_url && (
            <div className="bg-muted/30 border rounded-xl p-4 mb-12">
              <p className="text-sm text-muted-foreground mb-2">Источник:</p>
              <a 
                href={news.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary flex items-center gap-2 hover:underline"
              >
                {news.source_url}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
          
          {/* Related News */}
          {relatedNews.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Похожие новости</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map(item => (
                  <Link key={item.id} to={`/news/${item.slug}`}>
                    <Card className="overflow-hidden group hover:shadow-lg transition-all h-full">
                      <div className="aspect-video bg-muted relative overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                            <Newspaper className="w-8 h-8 text-primary/20" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), 'd MMMM yyyy', { locale: ru })}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
