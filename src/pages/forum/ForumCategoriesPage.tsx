import React, { useEffect, useState } from 'react';
import { blink } from '../../lib/blink';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { MessageSquare, ChevronRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export const ForumCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await blink.db.categories.list({ where: { type: 'forum' } });
        setCategories(data as Category[]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Форум сообщества</h1>
            <p className="text-muted-foreground">Обсуждайте финансовые вопросы с экспертами</p>
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse h-24 border-none bg-muted/50" />
            ))
          ) : categories.length > 0 ? (
            categories.map((cat) => (
              <Link key={cat.id} to={`/forum/category/${cat.id}`}>
                <Card className="hover:bg-muted/30 transition-all group border-none bg-muted/10 shadow-sm hover:shadow-md">
                  <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 opacity-50" />
                        {cat.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {cat.description || 'Обсуждение общих вопросов'}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <div className="py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <h3 className="text-xl font-bold opacity-50 italic">Разделы форума появятся скоро</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
