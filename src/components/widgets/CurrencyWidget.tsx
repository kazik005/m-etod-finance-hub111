import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { blink } from '../../lib/blink';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface CurrencyRate {
  id: string;
  code: string;
  name: string;
  rate: number;
}

export const CurrencyWidget = () => {
  const [rates, setRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    try {
      const data = await blink.db.currencyRates.list();
      setRates(data as CurrencyRate[]);
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  if (loading) return (
    <Card className="animate-pulse bg-muted/50 border-none shadow-none">
      <div className="h-[200px]" />
    </Card>
  );

  // If no rates in DB, show some defaults
  const displayRates = rates.length > 0 ? rates : [
    { id: '1', code: 'USD', name: 'Доллар США', rate: 91.50 },
    { id: '2', code: 'EUR', name: 'Евро', rate: 99.20 },
    { id: '3', code: 'CNY', name: 'Юань', rate: 12.65 },
  ];

  return (
    <Card className="overflow-hidden border-none bg-gradient-to-br from-primary/10 to-accent/10 shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Курсы валют
        </CardTitle>
        <RefreshCw className="w-4 h-4 text-muted-foreground hover:rotate-180 transition-transform cursor-pointer" onClick={fetchRates} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayRates.map((rate) => (
            <div key={rate.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 backdrop-blur-sm shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                  {rate.code}
                </div>
                <div>
                  <div className="font-semibold text-sm">{rate.name}</div>
                  <div className="text-[10px] text-muted-foreground">ЦБ РФ</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">
                  {rate.rate.toFixed(2)} ₽
                </div>
                <div className="flex items-center gap-1 text-[10px] text-green-500 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  +0.15%
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
