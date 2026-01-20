import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blink } from '../lib/blink';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Clock, User, ArrowLeft, Eye, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  image_url: string;
  category_id: string;
  created_at: string;
  views: number;
}

export const ArticleDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const data = await blink.db.articles.list({ where: { slug } });
        if (data.length > 0) {
          const art = data[0] as Article;
          setArticle(art);
          // Increment views
          await blink.db.articles.update(art.id, { views: (art.views || 0) + 1 });
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) return (
    <div className="container mx-auto px-4 py-20 animate-pulse space-y-8">
      <div className="h-8 w-64 bg-muted rounded mx-auto" />
      <div className="h-[400px] w-full bg-muted rounded-2xl" />
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    </div>
  );

  if (!article) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Статья не найдена</h1>
      <Link to="/articles">
        <Button variant="outline">Вернуться к списку</Button>
      </Link>
    </div>
  );

  return (
    <div className="pb-20">
      {/* Article Header */}
      <div className="bg-muted/30 pt-12 pb-20 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            <Link to="/articles" className="inline-flex items-center text-sm text-primary hover:underline gap-2 mb-4 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Все статьи
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <User className="w-4 h-4" />
                </div>
                M-etod Hub
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {format(new Date(article.created_at), 'd MMMM yyyy', { locale: ru })}
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                {article.views + 1} просмотров
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 -mt-12">
        <article className="max-w-3xl mx-auto bg-background rounded-3xl shadow-xl shadow-primary/5 p-8 md:p-12 border">
          {article.image_url && (
            <div className="w-full aspect-video rounded-2xl overflow-hidden mb-12 shadow-inner">
              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="prose prose-lg dark:prose-invert prose-primary max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-p:text-muted-foreground">
            {article.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-4">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-bold mt-6 mb-3">{line.replace('### ', '')}</h3>;
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-4">{line}</p>;
            })}
          </div>
        </article>
      </div>
    </div>
  );
};
