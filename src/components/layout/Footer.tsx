import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { blink } from '../../lib/blink';
import { toast } from 'react-hot-toast';
import { Mail, Loader2 } from 'lucide-react';

export const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Введите корректный email');
      return;
    }

    setLoading(true);
    try {
      const existing = await blink.db.newsletterSubscriptions.list({
        where: { email },
        limit: 1
      });

      if (existing && existing.length > 0) {
        toast.error('Вы уже подписаны на рассылку');
        setLoading(false);
        return;
      }

      await blink.db.newsletterSubscriptions.create({
        email,
        isActive: 1,
        userId: 'anonymous'
      });

      toast.success('Вы успешно подписались!');
      setEmail('');
    } catch (error) {
      toast.error('Ошибка подписки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="w-full border-t bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                M-etod Hub
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Ваш надежный партнер в мире финансов. Лучшие офферы, актуальные статьи и живое сообщество.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/offers" className="hover:text-primary transition-colors">Офферы</Link></li>
              <li><Link to="/articles" className="hover:text-primary transition-colors">Статьи</Link></li>
              <li><Link to="/forum" className="hover:text-primary transition-colors">Форум</Link></li>
              <li><Link to="/rates" className="hover:text-primary transition-colors">Курсы валют</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Информация</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">О проекте</Link></li>
              <li><Link to="/contacts" className="hover:text-primary transition-colors">Контакты</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Политика конфиденциальности</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Подписка на новости
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Получайте лучшие предложения на email
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input
                type="email"
                placeholder="Ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-9 text-sm"
              />
              <Button type="submit" size="sm" disabled={loading} className="h-9">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'OK'}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} M-etod Finance Hub. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};
