'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '@/contexts/AuthContext'; // Temporarily disabled
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Plus,
  RefreshCw,
  Calendar,
  Filter,
  TrendingUp,
  Rss,
  Search,
  User,
  LogOut,
} from 'lucide-react';
import { AddFeedDialog } from './add-feed-dialog';

interface Feed {
  id: string;
  name: string;
  url: string;
  description?: string;
  isActive: boolean;
  lastFetched?: string;
  _count: { articles: number };
}

interface SidebarProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  selectedFeedId: string | null;
  onFeedSelect: (feedId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Sidebar({
  selectedFilter,
  onFilterChange,
  selectedFeedId,
  onFeedSelect,
  searchQuery,
  onSearchChange,
}: SidebarProps) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  // Mock user data for now - no auth dependencies
  const user = { email: 'demo@example.com' };
  const signOut = async () => {
    console.log('Logout functionality will be restored');
    alert('App is working! Logout will be restored next.');
  };
  const router = useRouter();

  const fetchFeeds = async () => {
    try {
      const response = await fetch('/api/feeds');
      if (response.ok) {
        const data = await response.json();
        setFeeds(data);
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const refreshFeed = async (feedId: string) => {
    try {
      const response = await fetch(`/api/feeds/${feedId}/refresh`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchFeeds();
      }
    } catch (error) {
      console.error('Error refreshing feed:', error);
    }
  };

  const filters = [
    { id: 'all', label: 'All Articles', icon: Filter },
    { id: 'today', label: 'Today', icon: Calendar },
    { id: 'week', label: 'This Week', icon: Calendar },
    { id: 'month', label: 'This Month', icon: Calendar },
    { id: 'lastMonth', label: 'Last Month', icon: Calendar },
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="w-80 bg-muted/20 border-r p-4 overflow-y-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">RSS Sales Intelligence</h1>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* User Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              {user?.email}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => router.push('/profile')}
            >
              <User className="h-4 w-4 mr-2" />
              Brugerprofil
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log ud
            </Button>
          </CardContent>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onFilterChange(filter.id)}
              >
                <filter.icon className="h-4 w-4 mr-2" />
                {filter.label}
              </Button>
            ))}
            <Button
              variant={selectedFilter === 'sales' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onFilterChange('sales')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Sales Intelligence
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Rss className="h-5 w-5" />
              RSS Feeds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={selectedFeedId === null ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onFeedSelect(null)}
            >
              All Feeds
            </Button>
            {feeds.map((feed) => (
              <div key={feed.id} className="flex items-center gap-2">
                <Button
                  variant={selectedFeedId === feed.id ? 'default' : 'ghost'}
                  className="flex-1 justify-start"
                  onClick={() => onFeedSelect(feed.id)}
                >
                  <div className="text-left truncate">
                    <div className="font-medium truncate">{feed.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {feed._count.articles} articles
                    </div>
                  </div>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => refreshFeed(feed.id)}
                  className="p-2"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <AddFeedDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onFeedAdded={fetchFeeds}
      />
    </div>
  );
}