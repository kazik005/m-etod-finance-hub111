import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { toast } from 'react-hot-toast';
import { KeyRound } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Введите email адрес');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Ссылка для сброса пароля отправлена на ваш email');
    } catch (error: any) {
      toast.error(error.message || 'Не удалось отправить инструкции');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Восстановление пароля</CardTitle>
        </CardHeader>
        {sent ? (
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground mb-6">
              Мы отправили инструкции по восстановлению пароля на адрес <strong>{email}</strong>.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">Вернуться ко входу</Button>
            </Link>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Введите ваш Email, и мы отправим вам ссылку для сброса пароля.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  type="email" 
                  placeholder="email@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Загрузка...' : 'Отправить инструкции'}
              </Button>
              <Link to="/login" className="text-sm text-primary hover:underline font-medium">
                Вернуться ко входу
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};
