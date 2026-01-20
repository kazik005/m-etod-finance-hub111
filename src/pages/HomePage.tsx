import React, { useEffect, useState } from 'react';
import { CurrencyWidget } from '../components/widgets/CurrencyWidget';
import { ForumFeedWidget } from '../components/widgets/ForumFeedWidget';
import { CreditRating } from '../components/widgets/CreditRating';
import { CreditCalculator } from '../components/widgets/CreditCalculator';
import { NewsletterSubscription } from '../components/widgets/NewsletterSubscription';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CreditCard, ArrowRight, Star, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { blink } from '../lib/blink';
import { LiveSearch } from '../components/widgets/LiveSearch';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string;
  external_url: string;
  rating: number;
}

export const HomePage = () => {
  const [featuredOffers, setFeaturedOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const data = await blink.db.offers.list({
          where: { is_featured: 1 },
          limit: 3
        });
        setFeaturedOffers(data as Offer[]);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return (
    <div className="flex flex-col gap-12 pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1758641682181-1a817db17df0?auto=format&fit=crop&q=80&w=2000" 
            alt="Finance Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20 pb-12">
          <div className="text-left animate-in">
            <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/10 text-primary py-1.5 px-4 text-xs font-bold tracking-[0.2em] uppercase">
              Financial Ecosystem 2026
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-foreground">
              Управляйте <br />
              своим <span className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient text-transparent bg-clip-text">капиталом</span> <br />
              с M-etod
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed font-medium">
              Агрегатор лучших финансовых предложений, экспертная аналитика и живое сообщество для тех, кто ценит свое время и деньги.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Link to="/offers">
                <Button size="lg" className="h-14 px-10 text-lg font-bold bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
                  Выбрать оффер
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/forum">
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold glass-dark hover:bg-primary/10 transition-all border-white/10 text-foreground">
                  Сообщество
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-8 border-t border-border/50 pt-10">
              <div>
                <div className="text-3xl font-bold text-foreground">50k+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Клиентов</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">120+</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Офферов</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">4.9</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Рейтинг</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative animate-in [animation-delay:200ms]">
            <div className="relative z-10 glass rounded-3xl p-8 border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Быстрый поиск</h3>
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <LiveSearch />
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer group">
                  <CreditCard className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <div className="font-bold">Карты</div>
                </div>
                <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors cursor-pointer group">
                  <TrendingUp className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
                  <div className="font-bold">Кредиты</div>
                </div>
              </div>
            </div>
            {/* Decorative Orbs */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Widgets */}
        <aside className="lg:col-span-4 space-y-8">
          <CurrencyWidget />
          <CreditRating />
          <CreditCalculator />
          <ForumFeedWidget />
          
          <Card className="bg-primary text-primary-foreground border-none shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-24 h-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Станьте автором</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90 leading-relaxed">
                Делитесь своим опытом и зарабатывайте репутацию в нашем сообществе.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full font-bold">Подробнее</Button>
            </CardFooter>
          </Card>
        </aside>

        {/* Main Column: Featured Content */}
        <main className="lg:col-span-8 space-y-12">
          {/* Featured Offers */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                Лучшие предложения
              </h2>
              <Link to="/offers" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
                Все офферы
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                Array(2).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-muted/50 h-[250px] border-none" />
                ))
              ) : featuredOffers.length > 0 ? (
                featuredOffers.map((offer) => (
                  <Card key={offer.id} className="group hover:shadow-2xl transition-all duration-300 border-none bg-muted/30">
                    <CardHeader className="pb-2">
                      <div className="w-full aspect-video rounded-xl bg-background overflow-hidden mb-4 relative">
                        {offer.image_url ? (
                          <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                            <CreditCard className="w-12 h-12 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background border-none">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                            {offer.rating || 5.0}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">{offer.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {offer.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <a href={offer.external_url} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button className="w-full group-hover:translate-y-[-2px] transition-transform shadow-md">Оформить сейчас</Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 py-12 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50 text-center text-muted-foreground italic">
                  Пока здесь нет предложений
                </div>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Быстро', desc: 'Моментальное одобрение большинства заявок', icon: Zap, color: 'text-orange-500' },
              { title: 'Надежно', desc: 'Только проверенные партнеры и банки', icon: ShieldCheck, color: 'text-blue-500' },
              { title: 'Выгодно', desc: 'Специальные условия для наших пользователей', icon: TrendingUp, color: 'text-green-500' },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-shadow">
                <feature.icon className={`w-10 h-10 mb-4 ${feature.color}`} />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Newsletter Subscription */}
          <NewsletterSubscription />
        </main>
      </div>
    </div>
  );
};
