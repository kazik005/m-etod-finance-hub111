import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { blink } from '../../lib/blink';
import { toast } from 'react-hot-toast';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Введите корректный email');
      return;
    }

    setLoading(true);
    try {
      // Check if already subscribed
      const existing = await blink.db.newsletterSubscriptions.list({
        where: { email },
        limit: 1
      });

      if (existing && existing.length > 0) {
        toast.error('Вы уже подписаны на рассылку');
        setLoading(false);
        return;
      }

      // Create new subscription
      await blink.db.newsletterSubscriptions.create({
        email,
        isActive: 1,
        userId: 'anonymous'
      });

      setSubscribed(true);
      toast.success('Вы успешно подписались на рассылку!');
      setEmail('');
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Не удалось подписаться. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-bold text-lg mb-2">Спасибо за подписку!</h3>
          <p className="text-sm text-muted-foreground">
            Вы будете получать новости о лучших финансовых предложениях
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Mail className="w-32 h-32" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-xl bg-primary/10">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          Подпишитесь на рассылку
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Получайте лучшие финансовые предложения и полезные статьи прямо на вашу почту
        </p>
        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            required
          />
          <Button type="submit" disabled={loading} className="shrink-0">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Подписка...
              </>
            ) : (
              'Подписаться'
            )}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          Нажимая кнопку, вы соглашаетесь с получением рассылки. Отписаться можно в любой момент.
        </p>
      </CardContent>
    </Card>
  );
};
