import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { ShieldCheck, Info, TrendingUp, AlertCircle } from 'lucide-react';

export const CreditRating = () => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const simulateRating = () => {
    setLoading(true);
    setTimeout(() => {
      setScore(Math.floor(Math.random() * (850 - 300 + 1)) + 300);
      setLoading(false);
    }, 1500);
  };

  const getRatingInfo = (s: number) => {
    if (s >= 750) return { label: 'Отличный', color: 'text-green-500', bg: 'bg-green-500', desc: 'У вас высокие шансы на одобрение любых кредитных продуктов.' };
    if (s >= 650) return { label: 'Хороший', color: 'text-blue-500', bg: 'bg-blue-500', desc: 'Вам доступны большинство карт и кредитов с хорошими ставками.' };
    if (s >= 550) return { label: 'Средний', color: 'text-orange-500', bg: 'bg-orange-500', desc: 'Могут потребоваться дополнительные документы для одобрения.' };
    return { label: 'Низкий', color: 'text-destructive', bg: 'bg-destructive', desc: 'Рекомендуем начать с микрозаймов для улучшения истории.' };
  };

  return (
    <Card className="border-none shadow-xl bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Узнать кредитный рейтинг
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!score ? (
          <div className="text-center space-y-4 py-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Получите мгновенную оценку вашей кредитоспособности на основе алгоритмов M-etod.
            </p>
            <Button onClick={simulateRating} className="w-full h-12" disabled={loading}>
              {loading ? 'Проверка...' : 'Рассчитать рейтинг'}
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Info className="w-3 h-3" />
              Бесплатно и без влияния на КИ
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center space-y-2">
              <span className={`text-5xl font-black ${getRatingInfo(score).color}`}>
                {score}
              </span>
              <p className="font-bold text-lg">{getRatingInfo(score).label}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-muted-foreground">
                <span>300</span>
                <span>850</span>
              </div>
              <Progress value={((score - 300) / 550) * 100} className="h-2" />
            </div>

            <div className="p-4 rounded-xl bg-background/50 border space-y-3">
              <div className="flex gap-3">
                <div className={`p-2 rounded-lg ${getRatingInfo(score).bg} bg-opacity-10`}>
                  <AlertCircle className={`w-4 h-4 ${getRatingInfo(score).color}`} />
                </div>
                <p className="text-sm leading-relaxed">{getRatingInfo(score).desc}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-primary hover:text-primary hover:bg-primary/5"
                onClick={() => setScore(null)}
              >
                Проверить снова
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
