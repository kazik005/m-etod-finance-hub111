import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ForumCategoriesPage } from './forum/ForumCategoriesPage';
import { ForumTopicsPage } from './forum/ForumTopicsPage';
import { ForumTopicDetailPage } from './forum/ForumTopicDetailPage';

export const ForumPage = () => {
  return (
    <Routes>
      <Route path="/" element={<ForumCategoriesPage />} />
      <Route path="/category/:id" element={<ForumTopicsPage />} />
      <Route path="/topic/:id" element={<ForumTopicDetailPage />} />
    </Routes>
  );
};
