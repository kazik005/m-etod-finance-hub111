import React, { useEffect, useState } from 'react';
import { blink } from '../lib/blink';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CreditCard, Star, Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '../components/ui/input';

interface Offer {
  id: string;
  title: string;
  description: string;
  image_url: string;
  external_url: string;
  rating: number;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const OffersPage = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [offersData, catsData] = await Promise.all([
          blink.db.offers.list(),
          blink.db.categories.list({ where: { type: 'offer' } })
        ]);
        setOffers(offersData as Offer[]);
        setCategories(catsData as Category[]);
      } catch (error) {
        console.error('Failed to fetch offers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOffers = offers.filter(offer => {
    const matchesCategory = selectedCategory === 'all' || offer.category_id === selectedCategory;
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         offer.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Финансовые предложения</h1>
            <p className="text-muted-foreground">Найдите лучшие условия для ваших целей</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Поиск офферов..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Фильтры
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Button 
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="rounded-full px-6"
          >
            Все
          </Button>
          {categories.map((cat) => (
            <Button 
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full px-6 whitespace-nowrap"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse bg-muted/50 h-[350px] border-none shadow-none" />
            ))
          ) : filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <Card key={offer.id} className="flex flex-col group hover:shadow-xl transition-all duration-300 border-none bg-muted/20">
                <CardHeader className="pb-4">
                  <div className="w-full aspect-[16/9] rounded-xl bg-background overflow-hidden relative shadow-inner">
                    {offer.image_url ? (
                      <img src={offer.image_url} alt={offer.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                        <CreditCard className="w-16 h-16 text-primary/20" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-none">
                      {categories.find(c => c.id === offer.category_id)?.name || 'Финансы'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{offer.title}</CardTitle>
                    <div className="flex items-center text-yellow-500 text-sm font-bold">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {offer.rating || 5.0}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {offer.description}
                  </p>
                </CardContent>
                <CardFooter className="pt-0">
                  <a href={offer.external_url} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button className="w-full h-11 bg-primary hover:opacity-90 shadow-md">
                      Перейти к оформлению
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Ничего не найдено</h3>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска или категорию</p>
              </div>
              <Button variant="link" onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}>
                Сбросить все фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
