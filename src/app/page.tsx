'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/sidebar';
import { ArticleList } from '@/components/articles/article-list';

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedFeedId, setSelectedFeedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, loading } = useAuth();
  const router = useRouter();

  // Temporarily disable authentication redirect for testing
  // useEffect(() => {
  //   // Redirect to login if not authenticated
  //   if (!loading && !user) {
  //     console.log('Redirecting to login - no authenticated user');
  //     router.push('/login');
  //   }
  // }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Indlæser RSS Sales Intelligence...</p>
        </div>
      </div>
    );
  }

  // Temporarily allow access without authentication
  // if (!user) {
  //   return (
  //     <div className="h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <p className="text-gray-600">Redirecting to login...</p>
  //       </div>
  //     </div>
  //   );
  // }

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