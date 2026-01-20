import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderTree, 
  CreditCard, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  ChevronRight,
  Newspaper,
  Sparkles
} from 'lucide-react';
import { AdminDashboard } from './admin/AdminDashboard';
import { ManageCategories } from './admin/ManageCategories';
import { ManageOffers } from './admin/ManageOffers';
import { ManageArticles } from './admin/ManageArticles';
import { ManageNewsParser } from './admin/ManageNewsParser';
import { ManageAIContent } from './admin/ManageAIContent';
import { ManageForum } from './admin/ManageForum';
import { ManageRates } from './admin/ManageRates';
import { cn } from '../lib/utils';

export const AdminPage = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Обзор', href: '/admin', icon: LayoutDashboard },
    { name: 'Категории', href: '/admin/categories', icon: FolderTree },
    { name: 'Офферы', href: '/admin/offers', icon: CreditCard },
    { name: 'Статьи', href: '/admin/articles', icon: FileText },
    { name: 'AI Генерация', href: '/admin/ai', icon: Sparkles },
    { name: 'Парсер статей', href: '/admin/news', icon: Newspaper },
    { name: 'Форум', href: '/admin/forum', icon: MessageSquare },
    { name: 'Курсы валют', href: '/admin/rates', icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-muted/30 border-r p-6 space-y-8">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 px-2">
            Админ панель
          </h2>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-xl text-sm font-medium transition-all group",
                  location.pathname === item.href 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </div>
                <ChevronRight className={cn(
                  "w-4 h-4 transition-transform",
                  location.pathname === item.href ? "translate-x-0 opacity-100" : "opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0"
                )} />
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 bg-background p-6 md:p-10">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/categories" element={<ManageCategories />} />
          <Route path="/offers" element={<ManageOffers />} />
          <Route path="/articles" element={<ManageArticles />} />
          <Route path="/news" element={<ManageNewsParser />} />
          <Route path="/forum" element={<ManageForum />} />
          <Route path="/rates" element={<ManageRates />} />
        </Routes>
      </main>
    </div>
  );
};