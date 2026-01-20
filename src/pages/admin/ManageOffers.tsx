import React, { useEffect, useState } from 'react';
import { blink } from '../../lib/blink';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../../components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '../../components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Plus, Pencil, Trash2, CreditCard, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

interface Offer {
  id: string;
  title: string;
  category_id: string;
  description: string;
  image_url: string;
  external_url: string;
  rating: number;
  is_featured: number;
}

interface Category {
  id: string;
  name: string;
}

export const ManageOffers = () => {
  const { user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    image_url: '',
    external_url: '',
    rating: 5.0,
    is_featured: 0
  });

  const fetchData = async () => {
    try {
      const [offersData, catsData] = await Promise.all([
        blink.db.offers.list(),
        blink.db.categories.list({ where: { type: 'offer' } })
      ]);
      setOffers(offersData as Offer[]);
      setCategories(catsData as Category[]);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.title || !formData.category_id || !formData.external_url) {
      toast.error('Заполните обязательные поля');
      return;
    }

    try {
      setLoading(true);
      const dataToSave = {
        title: formData.title,
        category_id: formData.category_id,
        description: formData.description,
        image_url: formData.image_url,
        external_url: formData.external_url,
        rating: Number(formData.rating),
        is_featured: formData.is_featured ? "1" : "0",
        user_id: user.id
      };

      if (editingId) {
        await blink.db.offers.update(editingId, dataToSave);
        toast.success('Оффер обновлен');
      } else {
        await blink.db.offers.create(dataToSave);
        toast.success('Оффер создан');
      }
      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error('Ошибка при сохранении: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setFormData({
      title: offer.title,
      category_id: offer.category_id,
      description: offer.description || '',
      image_url: offer.image_url || '',
      external_url: offer.external_url,
      rating: Number(offer.rating) || 5.0,
      is_featured: Number(offer.is_featured) > 0 ? 1 : 0
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены?')) return;
    try {
      await blink.db.offers.delete(id);
      toast.success('Оффер удален');
      fetchData();
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ 
      title: '', 
      category_id: '', 
      description: '', 
      image_url: '', 
      external_url: '', 
      rating: 5.0,
      is_featured: 0 
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Управление офферами</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Добавить оффер
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Редактировать' : 'Создать'} оффер</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Заголовок</label>
                <Input 
                  placeholder="Карта 'Максимум'" 
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Категория</label>
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Рейтинг</label>
                <Input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Внешняя ссылка</label>
                <Input 
                  placeholder="https://bank.ru/apply" 
                  value={formData.external_url}
                  onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">URL изображения</label>
                <Input 
                  placeholder="https://image.com/logo.png" 
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Описание</label>
                <Textarea 
                  placeholder="Особенности и преимущества..." 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  id="featured" 
                  checked={formData.is_featured === 1}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked ? 1 : 0 })}
                />
                <label htmlFor="featured" className="text-sm font-medium">На главную</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
              <Button onClick={handleSubmit}>Сохранить</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-muted/10 rounded-2xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Рейтинг</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">Загрузка...</TableCell></TableRow>
            ) : offers.length > 0 ? (
              offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {offer.title}
                      <a href={offer.external_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3 text-primary" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {categories.find(c => c.id === offer.category_id)?.name || 'N/A'}
                  </TableCell>
                  <TableCell>{offer.rating}</TableCell>
                  <TableCell>{Number(offer.is_featured) > 0 ? 'Да' : 'Нет'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                        <Pencil className="w-4 h-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground italic">Офферов не найдено</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};