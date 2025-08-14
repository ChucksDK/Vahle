'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import {
  Eye,
  EyeOff,
  ExternalLink,
  TrendingUp,
  Clock,
  User,
  Tag,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ScoreBreakdownTooltip } from './score-breakdown-tooltip';

interface Article {
  id: string;
  title: string;
  description?: string;
  content?: string;
  author?: string;
  link: string;
  pubDate?: string;
  imageUrl?: string;
  isRead: boolean;
  feed: {
    name: string;
  };
  aiEvaluation?: {
    relevanceScore: number;
    keyReasons: string;
    suggestedActions?: string;
    categories: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    summary?: string;
    scoreBreakdown?: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ArticleListProps {
  filter: string;
  feedId: string | null;
  searchQuery: string;
}

export function ArticleList({ filter, feedId, searchQuery }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const articlesPerPage = 20;

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchArticles();
  }, [filter, feedId, searchQuery, sortOrder]);

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filter === 'sales') {
        params.append('sort', sortOrder);
        params.append('page', currentPage.toString());
        params.append('limit', articlesPerPage.toString());
        const response = await fetch(`/api/articles/sales-intelligence?${params}`);
        const data = await response.json();
        setArticles(data.articles || []);
        setPagination(data.pagination || null);
      } else {
        if (filter !== 'all') params.append('filter', filter);
        if (feedId) params.append('feedId', feedId);
        if (searchQuery) params.append('search', searchQuery);
        params.append('sort', sortOrder);
        params.append('page', currentPage.toString());
        params.append('limit', articlesPerPage.toString());
        
        const response = await fetch(`/api/articles?${params}`);
        const data = await response.json();
        setArticles(data.articles || []);
        setPagination(data.pagination || null);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setArticles([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleReadStatus = async (articleId: string, isRead: boolean) => {
    try {
      await fetch(`/api/articles/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      });
      
      setArticles((articles || []).map(article => 
        article.id === articleId 
          ? { ...article, isRead: !isRead }
          : article
      ));
    } catch (error) {
      console.error('Error updating article:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-500';
      case 'MEDIUM': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center text-muted-foreground">Loading articles...</div>
      </div>
    );
  }

  if (selectedArticle) {
    return (
      <div className="flex-1 p-6">
        <Button
          variant="outline"
          onClick={() => setSelectedArticle(null)}
          className="mb-4"
        >
          ← Back to articles
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {selectedArticle.author || 'Unknown'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedArticle.pubDate && format(new Date(selectedArticle.pubDate), 'PPP')}
              </span>
              <span className="bg-muted px-2 py-1 rounded">
                {selectedArticle.feed.name}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {selectedArticle.aiEvaluation && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  AI Sales Intelligence
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Relevance Score</span>
                    <ScoreBreakdownTooltip
                      scoreBreakdown={selectedArticle.aiEvaluation.scoreBreakdown}
                      totalScore={selectedArticle.aiEvaluation.relevanceScore}
                    >
                      <div className={`text-2xl font-bold cursor-help ${getScoreColor(selectedArticle.aiEvaluation.relevanceScore)}`}>
                        {selectedArticle.aiEvaluation.relevanceScore}/100
                      </div>
                    </ScoreBreakdownTooltip>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <div className={`text-lg font-semibold ${getPriorityColor(selectedArticle.aiEvaluation.priority)}`}>
                      {selectedArticle.aiEvaluation.priority}
                    </div>
                  </div>
                </div>
                {selectedArticle.aiEvaluation.summary && (
                  <p className="text-sm mb-3">{selectedArticle.aiEvaluation.summary}</p>
                )}
                <div className="mb-3">
                  <h4 className="font-medium mb-1">Key Reasons:</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {JSON.parse(selectedArticle.aiEvaluation.keyReasons || '[]').map((reason: string, index: number) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
                {selectedArticle.aiEvaluation.suggestedActions && (
                  <div className="mb-3">
                    <h4 className="font-medium mb-1">Suggested Actions:</h4>
                    <p className="text-sm">{selectedArticle.aiEvaluation.suggestedActions}</p>
                  </div>
                )}
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(selectedArticle.aiEvaluation.categories || '[]').map((category: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      <Tag className="h-3 w-3" />
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {selectedArticle.imageUrl && (
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full max-w-2xl mb-4 rounded-lg"
              />
            )}
            
            {selectedArticle.description && (
              <p className="text-muted-foreground mb-4">{selectedArticle.description}</p>
            )}
            
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: selectedArticle.content || selectedArticle.description || '',
              }}
            />
            
            <div className="flex items-center gap-2 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleReadStatus(selectedArticle.id, selectedArticle.isRead)}
              >
                {selectedArticle.isRead ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Mark as Unread
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Read
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(selectedArticle.link, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Original
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">
            {filter === 'sales' ? 'Sales Intelligence' : 'Articles'}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-2"
          >
            {sortOrder === 'asc' ? (
              <>
                <ArrowUp className="h-4 w-4" />
                Sort: Low to High
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4" />
                Sort: High to Low
              </>
            )}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {pagination ? (
            <>
              Showing {Math.min((currentPage - 1) * articlesPerPage + 1, pagination.total)}-{Math.min(currentPage * articlesPerPage, pagination.total)} of {pagination.total} article{pagination.total !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </>
          ) : (
            <>
              {(articles || []).length} article{(articles || []).length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {(articles || []).map((article) => (
          <Card
            key={article.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              !article.isRead ? 'border-l-4 border-l-primary' : ''
            }`}
            onClick={() => setSelectedArticle(article)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold mb-2 ${!article.isRead ? 'text-primary' : ''}`}>
                    {article.title}
                  </h3>
                  {article.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {article.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{article.feed.name}</span>
                    {article.author && <span>by {article.author}</span>}
                    {article.pubDate && (
                      <span>{format(new Date(article.pubDate), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                </div>

                {article.aiEvaluation && (
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <ScoreBreakdownTooltip
                      scoreBreakdown={article.aiEvaluation.scoreBreakdown}
                      totalScore={article.aiEvaluation.relevanceScore}
                    >
                      <div className={`text-right cursor-help ${getScoreColor(article.aiEvaluation.relevanceScore)}`}>
                        <div className="font-bold text-lg">
                          {article.aiEvaluation.relevanceScore}
                        </div>
                        <div className="text-xs">relevance</div>
                      </div>
                    </ScoreBreakdownTooltip>
                    <div className={`text-xs font-medium ${getPriorityColor(article.aiEvaluation.priority)}`}>
                      {article.aiEvaluation.priority}
                    </div>
                  </div>
                )}

                {article.imageUrl && (
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                  />
                )}
              </div>

              {article.aiEvaluation && JSON.parse(article.aiEvaluation.categories || '[]').length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {JSON.parse(article.aiEvaluation.categories || '[]').slice(0, 3).map((category: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      {category}
                    </span>
                  ))}
                  {JSON.parse(article.aiEvaluation.categories || '[]').length > 3 && (
                    <span className="text-xs text-muted-foreground self-center">
                      +{JSON.parse(article.aiEvaluation.categories || '[]').length - 3} more
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {(!articles || articles.length === 0) && !isLoading && (
          <div className="text-center text-muted-foreground py-12">
            No articles found. Try adjusting your filters or adding more RSS feeds.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(
                  pagination.totalPages - 4,
                  currentPage - 2
                )) + i;
                
                if (pageNumber > pagination.totalPages) return null;
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={currentPage === pagination.totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}