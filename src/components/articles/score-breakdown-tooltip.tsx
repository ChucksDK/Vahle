'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ScoreBreakdown {
  customerTypeMentions: number;
  projectTypes: number;
  targetSectors: number;
  relevantKeywords: number;
  explanation: string;
}

interface ScoreBreakdownTooltipProps {
  children: React.ReactNode;
  scoreBreakdown: string | null | undefined;
  totalScore: number;
}

export function ScoreBreakdownTooltip({ 
  children, 
  scoreBreakdown, 
  totalScore 
}: ScoreBreakdownTooltipProps) {
  let breakdown: ScoreBreakdown | null = null;
  
  try {
    breakdown = scoreBreakdown ? JSON.parse(scoreBreakdown) : null;
  } catch (error) {
    console.error('Failed to parse score breakdown:', error);
  }

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 60) return 'text-yellow-500';
    return 'text-gray-500';
  };

  const getBarColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-80">
          <div className="space-y-3">
            <div className="font-semibold text-sm border-b pb-2">
              Relevance Score Breakdown: {totalScore}/100
            </div>
            
            {breakdown ? (
              <div className="space-y-2 text-xs">
                {/* Customer Type Mentions */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Customer Types:</span>
                  <span className={`font-medium ${getScoreColor(breakdown.customerTypeMentions, 30)}`}>
                    {breakdown.customerTypeMentions}/30
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getBarColor(breakdown.customerTypeMentions, 30)}`}
                    style={{ width: `${Math.min(100, (breakdown.customerTypeMentions / 30) * 100)}%` }}
                  ></div>
                </div>

                {/* Project Types */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project Types:</span>
                  <span className={`font-medium ${getScoreColor(breakdown.projectTypes, 25)}`}>
                    {breakdown.projectTypes}/25
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getBarColor(breakdown.projectTypes, 25)}`}
                    style={{ width: `${Math.min(100, (breakdown.projectTypes / 25) * 100)}%` }}
                  ></div>
                </div>

                {/* Target Sectors */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Target Sectors:</span>
                  <span className={`font-medium ${getScoreColor(breakdown.targetSectors, 25)}`}>
                    {breakdown.targetSectors}/25
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getBarColor(breakdown.targetSectors, 25)}`}
                    style={{ width: `${Math.min(100, (breakdown.targetSectors / 25) * 100)}%` }}
                  ></div>
                </div>

                {/* Relevant Keywords */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Keywords:</span>
                  <span className={`font-medium ${getScoreColor(breakdown.relevantKeywords, 20)}`}>
                    {breakdown.relevantKeywords}/20
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full ${getBarColor(breakdown.relevantKeywords, 20)}`}
                    style={{ width: `${Math.min(100, (breakdown.relevantKeywords / 20) * 100)}%` }}
                  ></div>
                </div>

                {breakdown.explanation && (
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    {breakdown.explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Detailed breakdown not available for this article.
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}