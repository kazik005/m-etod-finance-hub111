import React, { useEffect, useState } from 'react';
import { blink } from '../lib/blink';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, Clock, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface Rate {
  id: string;
  code: string;
  name: string;
  rate: number;
  updated_at: string;
}

// Generate dummy historical data for the chart
const generateChartData = (baseRate: number) => {
  return Array.from({ length: 7 }).map((_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'dd.MM'),
    value: baseRate + (Math.random() - 0.5) * 2
  }));
};

export const RatesPage = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurrency, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await blink.db.currencyRates.list();
        setRates(data as Rate[]);
        if (data.length > 0) setSelectedCategory(data[0].code);
      } catch (error) {
        console.error('Failed to fetch rates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  const chartData = selectedCurrency 
    ? generateChartData(rates.find(r => r.code === selectedCurrency)?.rate || 90) 
    : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4 animate-in">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mx-auto shadow-inner">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Курсы валют</h1>
          <p className="text-muted-foreground text-lg">Аналитика и актуальные данные Центрального Банка РФ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">Текущие котировки</h3>
            <div className="space-y-3">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse bg-muted/50 h-24 border-none" />
                ))
              ) : rates.length > 0 ? (
                rates.map((rate) => (
                  <Card 
                    key={rate.id} 
                    className={`border-none shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${selectedCurrency === rate.code ? 'ring-2 ring-primary bg-primary/5' : 'bg-background'}`}
                    onClick={() => setSelectedCategory(rate.code)}
                  >
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {rate.code}
                        </div>
                        <div>
                          <div className="font-bold text-sm">{rate.name}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(rate.updated_at), 'HH:mm')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{rate.rate.toFixed(2)} ₽</div>
                        <div className="text-[10px] font-bold text-green-500 flex items-center justify-end gap-0.5">
                          <ArrowUpRight className="w-2.5 h-2.5" />
                          +0.12%
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <div className="py-10 text-center bg-muted/20 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground text-xs italic">Нет данных</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground px-2">Динамика за 7 дней</h3>
            <Card className="border-none shadow-xl bg-background overflow-hidden h-[400px]">
              <CardHeader className="pb-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {selectedCurrency || 'Выберите валюту'}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full pb-12 pt-6">
                {selectedCurrency ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      />
                      <YAxis 
                        hide 
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          borderColor: 'hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }}
                        itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center italic text-muted-foreground">
                    Выберите валюту в списке слева
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="bg-primary/5 border-none p-6 animate-in [animation-delay:400ms]">
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-primary/10 p-2 rounded-lg text-primary">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-foreground">Дисклеймер</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                Информация о курсах валют носит ознакомительный характер и не является публичной офертой. 
                Актуальные курсы для совершения операций уточняйте в отделениях соответствующих банков.
                Исторические данные на графике смоделированы для демонстрации интерфейса.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
