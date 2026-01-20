import React, { useState, useEffect } from 'react';
import { blink } from '../../lib/blink';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { 
  Sparkles, 
  Wand2, 
  Loader2, 
  Copy, 
  Save, 
  RefreshCcw,
  FileText,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

export const ManageAIContent = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Generator state
  const [genTopic, setGenTopic] = useState('');
  const [genTitle, setGenTitle] = useState('');
  const [genContent, setGenContent] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // Rewriter state
  const [rewriteInput, setRewriteInput] = useState('');
  const [rewriteOutput, setRewriteOutput] = useState('');
  const [rewriting, setRewriting] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      const data = await blink.db.categories.list({ where: { type: 'article' } });
      setCategories(data as any[]);
    };
    fetchCats();
  }, []);

  // Generate article from topic
  const generateArticle = async () => {
    if (!genTopic.trim()) {
      toast.error('Введите тему для генерации');
      return;
    }

    setGenerating(true);
    try {
      const { text } = await blink.ai.generateText({
        messages: [
          {
            role: 'system',
            content: `Ты - профессиональный финансовый копирайтер с 10-летним опытом. 
Твоя задача - писать SEO-оптимизированные статьи для финансового портала на русском языке.
Статьи должны быть:
- Информативными и полезными для читателя
- Структурированными с подзаголовками (##)
- Содержать практические советы
- Длиной 800-1500 слов
- Уникальными и интересными

Формат ответа:
ЗАГОЛОВОК: [привлекательный заголовок]
---
[Текст статьи с подзаголовками и параграфами]`
          },
          {
            role: 'user',
            content: `Напиши подробную статью на тему: "${genTopic}"
        
Статья должна содержать:
1. Привлекательное введение
2. 3-5 основных разделов с подзаголовками
3. Практические советы или рекомендации
4. Заключение с призывом к действию`
          }
        ],
        maxTokens: 3000,
      });

      const lines = text.split('\n');
      const titleLine = lines.find(l => l.startsWith('ЗАГОЛОВОК:'));
      const title = titleLine ? titleLine.replace('ЗАГОЛОВОК:', '').trim() : genTopic;
      const contentStart = text.indexOf('---');
      const content = contentStart > -1 ? text.slice(contentStart + 3).trim() : text;

      setGenTitle(title);
      setGenContent(content);
      toast.success('Статья успешно сгенерирована');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при генерации статьи');
    } finally {
      setGenerating(false);
    }
  };

  // Rewrite text
  const rewriteText = async () => {
    if (!rewriteInput.trim()) {
      toast.error('Введите текст для рерайта');
      return;
    }

    setRewriting(true);
    try {
      const { text } = await blink.ai.generateText({
        messages: [
          {
            role: 'system',
            content: `Ты - профессиональный рерайтер. Твоя задача - переписать текст так, чтобы:
1. Сохранить весь смысл и факты оригинала
2. Сделать текст полностью уникальным (пройти проверку на антиплагиат)
3. Улучшить читаемость и структуру
4. Сохранить профессиональный стиль
5. Писать на русском языке

Не добавляй комментарии, просто выдай переписанный текст.`
          },
          {
            role: 'user',
            content: `Перепиши следующий текст, сделав его уникальным:\n\n${rewriteInput}`
          }
        ],
        maxTokens: 3000,
      });

      setRewriteOutput(text);
      toast.success('Текст успешно переписан');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при рерайте');
    } finally {
      setRewriting(false);
    }
  };

  // Save generated article to DB
  const saveArticle = async () => {
    if (!user || !selectedCategory || !genTitle || !genContent) {
      toast.error('Выберите категорию и сгенерируйте статью');
      return;
    }

    try {
      const slug = genTitle
        .toLowerCase()
        .replace(/[^a-z0-9а-яё\s]+/gi, '')
        .replace(/\s+/g, '-')
        .slice(0, 60) + '-' + Date.now().toString().slice(-4);

      await blink.db.articles.create({
        title: genTitle,
        slug,
        content: genContent,
        category_id: selectedCategory,
        status: 'published',
        user_id: user.id,
      });

      toast.success('Статья сохранена!');
      setGenTopic('');
      setGenTitle('');
      setGenContent('');
    } catch (error) {
      console.error(error);
      toast.error('Ошибка при сохранении');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано в буфер');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">AI Генерация контента</h1>
        <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-none">
          GPT-4
        </Badge>
      </div>

      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
          <TabsTrigger value="generator" className="rounded-lg px-8 gap-2">
            <FileText className="w-4 h-4" />
            Генератор статей
          </TabsTrigger>
          <TabsTrigger value="rewriter" className="rounded-lg px-8 gap-2">
            <RotateCcw className="w-4 h-4" />
            Рерайтер
          </TabsTrigger>
        </TabsList>

        {/* Article Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                Генерация статьи по теме
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-sm font-medium">Тема статьи</label>
                  <Input
                    placeholder="Например: Как выбрать выгодный кредит в 2025 году"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Категория</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={generateArticle} 
                disabled={generating}
                className="w-full gap-2"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Генерация...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Сгенерировать статью
                  </>
                )}
              </Button>

              {genTitle && (
                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Заголовок</label>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(genTitle)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Input
                      value={genTitle}
                      onChange={(e) => setGenTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Содержание</label>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(genContent)}>
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Textarea
                      className="min-h-[400px] font-mono text-sm"
                      value={genContent}
                      onChange={(e) => setGenContent(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={saveArticle} className="gap-2">
                      <Save className="w-4 h-4" />
                      Сохранить как статью
                    </Button>
                    <Button variant="outline" onClick={generateArticle} className="gap-2">
                      <RefreshCcw className="w-4 h-4" />
                      Перегенерировать
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewriter Tab */}
        <TabsContent value="rewriter" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Исходный текст</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Вставьте текст для рерайта..."
                  className="min-h-[350px]"
                  value={rewriteInput}
                  onChange={(e) => setRewriteInput(e.target.value)}
                />
                <Button 
                  onClick={rewriteText} 
                  disabled={rewriting}
                  className="w-full gap-2"
                >
                  {rewriting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Обработка...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Переписать текст
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  Результат рерайта
                  {rewriteOutput && (
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(rewriteOutput)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rewriteOutput ? (
                  <Textarea
                    className="min-h-[350px]"
                    value={rewriteOutput}
                    onChange={(e) => setRewriteOutput(e.target.value)}
                  />
                ) : (
                  <div className="min-h-[350px] flex items-center justify-center border border-dashed rounded-xl">
                    <p className="text-muted-foreground text-sm">
                      Результат появится здесь
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
