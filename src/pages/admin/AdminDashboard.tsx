import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { blink } from '../../lib/blink';
import { 
  CreditCard, 
  FileText, 
  MessageSquare, 
  Users,
  TrendingUp,
  BarChart3,
  Database,
  Calendar
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { toast } from 'react-hot-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    offers: 0,
    articles: 0,
    topics: 0,
    categories: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchStats = async () => {
    try {
      const [offers, arts, topics, cats] = await Promise.all([
        blink.db.offers.count(),
        blink.db.articles.count(),
        blink.db.forumTopics.count(),
        blink.db.categories.count()
      ]);
      setStats({ offers, articles: arts, topics, categories: cats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Офферы', value: stats.offers, color: 'hsl(var(--chart-1))' },
    { name: 'Статьи', value: stats.articles, color: 'hsl(var(--chart-2))' },
    { name: 'Темы', value: stats.topics, color: 'hsl(var(--chart-3))' },
    { name: 'Кат-ии', value: stats.categories, color: 'hsl(var(--chart-4))' },
  ];

  const handleSeedData = async () => {
    if (!window.confirm('Это добавит демо-данные (категории, офферы, статьи). Продолжить?')) return;
    
    setIsSeeding(true);
    try {
      // 1. Create Categories
      const categories = [
        { id: 'cat_1', name: 'Кредитные карты', slug: 'credit-cards', type: 'offer', description: 'Лучшие кредитные карты с кэшбэком' },
        { id: 'cat_2', name: 'Потребительские кредиты', slug: 'loans', type: 'offer', description: 'Кредиты на любые цели' },
        { id: 'cat_3', name: 'Личные финансы', slug: 'personal-finance', type: 'article', description: 'Советы по экономии и накоплению' },
        { id: 'cat_4', name: 'Инвестиции', slug: 'investments', type: 'article', description: 'Куда вложить деньги в 2026 году' },
        { id: 'cat_5', name: 'Общий раздел', slug: 'general', type: 'forum', description: 'Обсуждение любых финансовых тем' },
      ];

      for (const cat of categories) {
        await blink.db.categories.upsert({ ...cat, user_id: 'system' });
      }

      // 2. Create Offers
      const offers = [
        {
          id: 'off_1',
          title: 'Тинькофф Платинум',
          category_id: 'cat_1',
          description: 'Кредитный лимит до 1 000 000 ₽. Беспроцентный период до 55 дней. Кэшбэк до 30% у партнеров.',
          external_url: 'https://www.tinkoff.ru/cards/credit-cards/platinum/',
          rating: 4.9,
          is_featured: 1,
          user_id: 'system'
        },
        {
          id: 'off_2',
          title: 'Альфа-Карта 365 дней',
          category_id: 'cat_1',
          description: 'Год без процентов на покупки в первые 30 дней. Бесплатное обслуживание навсегда.',
          external_url: 'https://alfabank.ru/get-card/credit/lp/365days/',
          rating: 4.8,
          is_featured: 1,
          user_id: 'system'
        }
      ];

      for (const offer of offers) {
        await blink.db.offers.upsert(offer);
      }

      // 3. Create Articles
      const articles = [
        {
          id: 'art_1',
          title: 'Как накопить на первый взнос по ипотеке за 2 года',
          slug: 'how-to-save-for-mortgage',
          category_id: 'cat_3',
          content: 'Накопление на первоначальный взнос — один из самых сложных этапов покупки жилья. В этой статье мы разберем стратегию 50/30/20 и покажем, как автоматизация накоплений поможет вам достичь цели быстрее. \n\nШаг 1: Анализ расходов. Используйте банковские приложения для категоризации трат.\nШаг 2: Открытие вклада с высокой ставкой. \nШаг 3: Минимизация импульсивных покупок.',
          status: 'published',
          is_featured: 1,
          user_id: 'system'
        },
        {
          id: 'art_2',
          title: 'Топ-5 инвестиционных инструментов 2026 года',
          slug: 'top-5-investments-2026',
          category_id: 'cat_4',
          content: 'Мир финансов меняется стремительно. В 2026 году на первый план выходят цифровые активы, облигации с плавающим купоном и фонды недвижимости. \n\n1. ОФЗ-ПК: защита от инфляции.\n2. Золотые слитки и монеты.\n3. Акции технологического сектора.\n4. Дивидендные аристократы.\n5. Краудлендинговые платформы.',
          status: 'published',
          is_featured: 1,
          user_id: 'system'
        }
      ];

      for (const art of articles) {
        await blink.db.articles.upsert(art);
      }

      // 4. Create Rates
      const rates = [
        { id: 'rate_1', code: 'USD', name: 'Доллар США', rate: 91.45, user_id: 'system' },
        { id: 'rate_2', code: 'EUR', name: 'Евро', rate: 99.12, user_id: 'system' },
        { id: 'rate_3', code: 'CNY', name: 'Юань', rate: 12.62, user_id: 'system' },
      ];

      for (const rate of rates) {
        await blink.db.currencyRates.upsert(rate);
      }

      toast.success('Демо-данные успешно добавлены!');
      fetchStats();
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при заполнении данных');
    } finally {
      setIsSeeding(false);
    }
  };

  const cards = [
    { title: 'Всего офферов', value: stats.offers, icon: CreditCard, color: 'text-blue-500' },
    { title: 'Статей опубликовано', value: stats.articles, icon: FileText, color: 'text-green-500' },
    { title: 'Темы на форуме', value: stats.topics, icon: MessageSquare, color: 'text-purple-500' },
    { title: 'Категории', value: stats.categories, icon: BarChart3, color: 'text-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Обзор системы</h1>
        <p className="text-muted-foreground font-medium">Статистика и основные показатели вашего хаба</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-foreground">
        {cards.map((card, i) => (
          <Card key={i} className="border-none shadow-lg shadow-primary/5 bg-gradient-to-br from-background to-muted/20 overflow-hidden relative group hover:scale-[1.02] transition-transform">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-60">
                {card.title}
              </CardTitle>
              <card.icon className={`w-5 h-5 ${card.color} group-hover:scale-110 transition-transform`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">
                {loading ? '...' : card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                +12% за месяц
              </p>
            </CardContent>
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity`}>
              <card.icon className="w-24 h-24 rotate-12" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-foreground">
        <Card className="border-none shadow-xl bg-background overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Быстрые действия
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Если это ваш первый запуск, вы можете заполнить базу данных тестовыми категориями, офферами и статьями для проверки функционала.
            </p>
            <Button 
              onClick={handleSeedData} 
              disabled={isSeeding}
              variant="outline"
              className="w-full h-12 gap-2 border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <Database className="w-4 h-4" />
              {isSeeding ? 'Загрузка...' : 'Заполнить демо-данными'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-background overflow-hidden">
          <CardHeader className="bg-accent/5 border-b border-accent/10">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              Распределение контента
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
