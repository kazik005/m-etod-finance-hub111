import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { blink } from '../../lib/blink';
import { Input } from '../ui/input';
import { Search, Loader2, CreditCard, FileText, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchResult {
  id: string;
  title: string;
  type: 'offer' | 'article';
  slug?: string;
}

export const LiveSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [offers, articles] = await Promise.all([
          blink.db.offers.list({ 
            where: { title: { contains: query } },
            limit: 5 
          }),
          blink.db.articles.list({ 
            where: { title: { contains: query } },
            limit: 5 
          })
        ]);

        const formattedResults: SearchResult[] = [
          ...(offers as any[]).map(o => ({ id: o.id, title: o.title, type: 'offer' as const })),
          ...(articles as any[]).map(a => ({ id: a.id, title: a.title, type: 'article' as const, slug: a.slug }))
        ];

        setResults(formattedResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(search, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    if (result.type === 'offer') {
      navigate('/offers');
    } else {
      navigate(`/articles/${result.slug}`);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          )}
        </div>
        <Input
          className="w-full h-14 pl-12 pr-4 bg-background/50 backdrop-blur-sm border-2 border-border/50 rounded-2xl text-lg focus:border-primary focus:ring-primary/20 transition-all shadow-xl shadow-black/5"
          placeholder="Поиск офферов, статей, советов..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && (query.length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {results.length > 0 ? (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors text-left group"
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      result.type === 'offer' ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"
                    )}>
                      {result.type === 'offer' ? <CreditCard className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">{result.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {result.type === 'offer' ? 'Оффер' : 'Статья'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
                ))}
              </div>
            ) : !loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>Ничего не найдено по запросу "{query}"</p>
              </div>
            ) : null}
          </div>
          {results.length > 0 && (
            <div className="p-3 bg-muted/50 border-t text-center">
              <p className="text-xs text-muted-foreground">Нажмите на результат для перехода</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
