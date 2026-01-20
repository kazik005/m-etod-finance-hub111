import React, { useEffect, useState } from 'react';
import { blink } from '../../lib/blink';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { Plus, Pencil, Trash2, TrendingUp, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Rate {
  id: string;
  code: string;
  name: string;
  rate: number;
}

export const ManageRates = () => {
  const { user } = useAuth();
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    rate: 0
  });

  const fetchRates = async () => {
    try {
      const data = await blink.db.currencyRates.list();
      setRates(data as Rate[]);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    if (!formData.code || !formData.rate) return;

    try {
      if (editingId) {
        await blink.db.currencyRates.update(editingId, formData);
        toast.success('Курс обновлен');
      } else {
        await blink.db.currencyRates.create({
          ...formData,
          user_id: user.id
        });
        toast.success('Курс добавлен');
      }
      setEditingId(null);
      setFormData({ code: '', name: '', rate: 0 });
      fetchRates();
    } catch (error) {
      toast.error('Ошибка при сохранении');
    }
  };

  const handleEdit = (rate: Rate) => {
    setEditingId(rate.id);
    setFormData({
      code: rate.code,
      name: rate.name,
      rate: rate.rate
    });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены?')) return;
    try {
      await blink.db.currencyRates.delete(id);
      toast.success('Курс удален');
      fetchRates();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  return (
    <div className="space-y-8 text-foreground">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Управление курсами валют</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-muted/20 rounded-2xl border items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">Код (USD)</label>
          <Input 
            placeholder="USD" 
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Название</label>
          <Input 
            placeholder="Доллар США" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Курс (₽)</label>
          <Input 
            type="number" 
            step="0.01" 
            value={formData.rate}
            onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
          />
        </div>
        <Button onClick={handleSave} className="gap-2">
          {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {editingId ? 'Обновить' : 'Добавить'}
        </Button>
      </div>

      <div className="bg-muted/10 rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Код</TableHead>
              <TableHead>Валюта</TableHead>
              <TableHead>Курс</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8">Загрузка...</TableCell></TableRow>
            ) : rates.length > 0 ? (
              rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-bold text-primary">{rate.code}</TableCell>
                  <TableCell>{rate.name}</TableCell>
                  <TableCell className="font-medium">{rate.rate.toFixed(2)} ₽</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(rate)}>
                        <Pencil className="w-4 h-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(rate.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">Курсы не заданы</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
