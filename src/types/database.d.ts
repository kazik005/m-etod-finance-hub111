import { BlinkDatabase } from '@blinkdotnew/sdk';

export interface Offer {
  id: string;
  title: string;
  category_id: string;
  description: string;
  image_url: string;
  external_url: string;
  rating: number;
  is_featured: number;
  user_id: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  content: string;
  status: 'draft' | 'published';
  is_featured: number;
  user_id: string;
  created_at: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  category_id: string;
  image_url?: string;
  source_url?: string;
  user_id: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: 'offer' | 'article' | 'forum';
  description?: string;
  user_id: string;
}

export interface ForumTopic {
  id: string;
  title: string;
  category_id: string;
  user_id: string;
  created_at: string;
  is_locked: number;
  is_pinned: number;
}

export interface ForumPost {
  id: string;
  topic_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

export interface CurrencyRate {
  id: string;
  code: string;
  name: string;
  rate: number;
  updated_at: string;
  user_id: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: number;
  userId: string;
  created_at: string;
}

declare module '@blinkdotnew/sdk' {
  interface BlinkDatabase {
    offers: any;
    articles: any;
    news: any;
    categories: any;
    forumTopics: any;
    forumPosts: any;
    currencyRates: any;
    newsletterSubscriptions: any;
  }
}
