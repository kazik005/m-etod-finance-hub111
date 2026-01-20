import React, { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  keywords?: string[];
  canonicalUrl?: string;
  noIndex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'M-etod Finance Hub',
  keywords = [],
  canonicalUrl,
  noIndex = false
}) => {
  const siteName = 'M-etod Finance Hub';
  const defaultDescription = 'Финансовый хаб - лучшие финансовые офферы, экспертные статьи, форум и актуальные новости';
  const defaultImage = '/og-image.jpg';
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMetaTag = (selector: string, content: string, attribute = 'content') => {
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        const attrs = selector.match(/\[([^\]]+)\]/g);
        attrs?.forEach(attr => {
          const [key, value] = attr.slice(1, -1).split('=');
          tag?.setAttribute(key, value?.replace(/"/g, '') || '');
        });
        document.head.appendChild(tag);
      }
      tag.setAttribute(attribute, content);
    };

    // Basic Meta Tags
    updateMetaTag('meta[name="description"]', finalDescription);
    updateMetaTag('meta[name="author"]', author);
    
    if (keywords.length > 0) {
      updateMetaTag('meta[name="keywords"]', keywords.join(', '));
    }

    if (noIndex) {
      updateMetaTag('meta[name="robots"]', 'noindex, nofollow');
    } else {
      updateMetaTag('meta[name="robots"]', 'index, follow');
    }

    // Open Graph Tags
    updateMetaTag('meta[property="og:title"]', fullTitle);
    updateMetaTag('meta[property="og:description"]', finalDescription);
    updateMetaTag('meta[property="og:image"]', finalImage);
    updateMetaTag('meta[property="og:url"]', currentUrl);
    updateMetaTag('meta[property="og:type"]', type);
    updateMetaTag('meta[property="og:site_name"]', siteName);
    updateMetaTag('meta[property="og:locale"]', 'ru_RU');

    if (type === 'article') {
      if (publishedTime) {
        updateMetaTag('meta[property="article:published_time"]', publishedTime);
      }
      if (modifiedTime) {
        updateMetaTag('meta[property="article:modified_time"]', modifiedTime);
      }
      updateMetaTag('meta[property="article:author"]', author);
    }

    // Twitter Card Tags
    updateMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', finalDescription);
    updateMetaTag('meta[name="twitter:image"]', finalImage);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

  }, [fullTitle, finalDescription, finalImage, type, publishedTime, modifiedTime, author, keywords, currentUrl, noIndex]);

  return null;
};

// Schema.org Microdata component
interface ArticleSchemaProps {
  title: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  url?: string;
}

export const ArticleSchema: React.FC<ArticleSchemaProps> = ({
  title,
  description,
  image,
  datePublished,
  dateModified,
  author = 'M-etod Finance Hub',
  url
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: image || '/og-image.jpg',
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: author
    },
    publisher: {
      '@type': 'Organization',
      name: 'M-etod Finance Hub',
      logo: {
        '@type': 'ImageObject',
        url: '/favicon.svg'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url || (typeof window !== 'undefined' ? window.location.href : '')
    }
  };

  useEffect(() => {
    let script = document.querySelector('script[type="application/ld+json"][data-type="article"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-type', 'article');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      script?.remove();
    };
  }, [title, description, image, datePublished, dateModified, author, url]);

  return null;
};

// Organization Schema
export const OrganizationSchema: React.FC = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'M-etod Finance Hub',
    description: 'Финансовый хаб - лучшие финансовые офферы, экспертные статьи и новости',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    logo: '/favicon.svg',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@m-etod.ru'
    }
  };

  useEffect(() => {
    let script = document.querySelector('script[type="application/ld+json"][data-type="organization"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-type', 'organization');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      script?.remove();
    };
  }, []);

  return null;
};

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

export const BreadcrumbSchema: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  useEffect(() => {
    let script = document.querySelector('script[type="application/ld+json"][data-type="breadcrumb"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-type', 'breadcrumb');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      script?.remove();
    };
  }, [items]);

  return null;
};

// Product/Offer Schema
interface OfferSchemaProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  rating?: number;
}

export const OfferSchema: React.FC<OfferSchemaProps> = ({
  name,
  description,
  image,
  url,
  rating
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    name: name,
    description: description,
    image: image,
    url: url,
    provider: {
      '@type': 'Organization',
      name: 'M-etod Finance Hub'
    },
    ...(rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating,
        bestRating: 5,
        worstRating: 1
      }
    })
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute('data-type', 'offer');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      script?.remove();
    };
  }, [name, description, image, url, rating]);

  return null;
};

// FAQ Schema
interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSchema: React.FC<{ items: FAQItem[] }> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  useEffect(() => {
    let script = document.querySelector('script[type="application/ld+json"][data-type="faq"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-type', 'faq');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      script?.remove();
    };
  }, [items]);

  return null;
};
