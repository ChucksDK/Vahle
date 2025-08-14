'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { ArticleList } from '@/components/articles/article-list';

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen flex">
      <Sidebar
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedFeedId={selectedFeedId}
        onFeedSelect={setSelectedFeedId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <ArticleList
        filter={selectedFilter}
        feedId={selectedFeedId}
        searchQuery={searchQuery}
      />
    </div>
  );
}