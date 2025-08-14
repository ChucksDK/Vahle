-- RSS Sales Intelligence Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Priority enum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- Create Feed table
CREATE TABLE "Feed" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::TEXT,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastFetched" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feed_pkey" PRIMARY KEY ("id")
);

-- Create Article table
CREATE TABLE "Article" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::TEXT,
    "feedId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "author" TEXT,
    "link" TEXT NOT NULL,
    "guid" TEXT,
    "pubDate" TIMESTAMP(3),
    "imageUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- Create AiEvaluation table
CREATE TABLE "AiEvaluation" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::TEXT,
    "articleId" TEXT NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "keyReasons" TEXT[] NOT NULL,
    "suggestedActions" TEXT,
    "categories" TEXT[] NOT NULL,
    "priority" "Priority" NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiEvaluation_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "Feed_url_key" ON "Feed"("url");
CREATE UNIQUE INDEX "Article_link_key" ON "Article"("link");
CREATE UNIQUE INDEX "AiEvaluation_articleId_key" ON "AiEvaluation"("articleId");

-- Create indexes
CREATE INDEX "Article_feedId_idx" ON "Article"("feedId");
CREATE INDEX "Article_pubDate_idx" ON "Article"("pubDate");
CREATE INDEX "Article_isRead_idx" ON "Article"("isRead");
CREATE INDEX "AiEvaluation_relevanceScore_idx" ON "AiEvaluation"("relevanceScore");
CREATE INDEX "AiEvaluation_priority_idx" ON "AiEvaluation"("priority");

-- Add foreign key constraints
ALTER TABLE "Article" ADD CONSTRAINT "Article_feedId_fkey" FOREIGN KEY ("feedId") REFERENCES "Feed"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AiEvaluation" ADD CONSTRAINT "AiEvaluation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feed_updated_at BEFORE UPDATE ON "Feed" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_article_updated_at BEFORE UPDATE ON "Article" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_evaluation_updated_at BEFORE UPDATE ON "AiEvaluation" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();