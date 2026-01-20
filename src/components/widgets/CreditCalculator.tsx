import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calculator, Percent, Calendar, RussianRuble } from 'lucide-react';

export const CreditCalculator = () => {
  const [amount, setAmount] = useState<number>(500000);
  const [rate, setRate] = useState<number>(15);
  const [term, setTerm] = useState<number>(12);
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);
  const [totalPayment, setTotalPayment] = useState<number | null>(null);
  const [totalInterest, setTotalInterest] = useState<number | null>(null);

  const calculate = () => {
    const monthlyRate = rate / 100 / 12;
    const payment = amount * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    
    setMonthlyPayment(payment);
    setTotalPayment(payment * term);
    setTotalInterest((payment * term) - amount);
  };

  return (
    <Card className="border-none shadow-xl bg-muted/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          Кредитный калькулятор
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <RussianRuble className="w-4 h-4 text-muted-foreground" />
              Сумма кредита (₽)
            </Label>
            <Input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-muted-foreground" />
                Ставка (%)
              </Label>
              <Input 
                type="number" 
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Срок (мес.)
              </Label>
              <Input 
                type="number" 
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
              />
            </div>
          </div>
          <Button onClick={calculate} className="w-full h-12 text-lg">Рассчитать</Button>
        </div>

        {monthlyPayment !== null && (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ежемесячный платеж:</span>
              <span className="text-2xl font-bold text-primary">
                {Math.round(monthlyPayment).toLocaleString()} ₽
              </span>
            </div>
            <div className="pt-4 border-t border-primary/10 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Общая сумма выплат:</span>
                <span className="font-medium">{Math.round(totalPayment!).toLocaleString()} ₽</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Переплата по процентам:</span>
                <span className="font-medium text-orange-500">{Math.round(totalInterest!).toLocaleString()} ₽</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
