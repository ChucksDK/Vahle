import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateRssFeed, fetchFeedArticles } from '@/lib/rss-parser';
import { evaluateArticle } from '@/lib/ai-evaluator';
import { z } from 'zod';

const createFeedSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const feeds = await prisma.feed.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(feeds);
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json({ error: 'Failed to fetch feeds' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createFeedSchema.parse(body);

    const isValid = await validateRssFeed(validatedData.url);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid RSS feed URL' },
        { status: 400 }
      );
    }

    const existingFeed = await prisma.feed.findUnique({
      where: { url: validatedData.url },
    });

    if (existingFeed) {
      return NextResponse.json(
        { error: 'Feed already exists' },
        { status: 409 }
      );
    }

    const feed = await prisma.feed.create({
      data: validatedData,
    });

    // Automatically fetch articles from the last 24 hours for new feeds
    try {
      console.log(`Fetching initial articles for new feed: ${feed.name}`);
      const articles = await fetchFeedArticles(feed.url, 24);
      let newArticlesCount = 0;

      for (const article of articles) {
        if (!article.link) {
          continue; // Skip articles without links
        }

        try {
          const createdArticle = await prisma.article.create({
            data: {
              feedId: feed.id,
              title: article.title,
              description: article.description,
              content: article.content,
              author: article.author,
              link: article.link,
              guid: article.guid,
              pubDate: article.pubDate,
              imageUrl: article.imageUrl,
            },
          });

          // Evaluate the article with AI
          const evaluation = await evaluateArticle(
            article.title,
            article.content,
            article.description
          );

          await prisma.aiEvaluation.create({
            data: {
              articleId: createdArticle.id,
              ...evaluation,
            },
          });

          newArticlesCount++;
        } catch (createError: any) {
          // Handle duplicate constraint error gracefully
          if (createError.code === 'P2002') {
            console.log(`Article with link ${article.link} already exists, skipping...`);
          } else {
            console.error('Error creating article:', createError);
          }
        }
      }

      // Update the feed's lastFetched timestamp
      await prisma.feed.update({
        where: { id: feed.id },
        data: { lastFetched: new Date() },
      });

      console.log(`Successfully added ${newArticlesCount} articles for feed: ${feed.name}`);
      
      return NextResponse.json({
        ...feed,
        initialArticlesCount: newArticlesCount,
      }, { status: 201 });
    } catch (fetchError) {
      console.error('Error fetching initial articles for new feed:', fetchError);
      // Return the feed even if article fetching fails - the user can manually refresh
      return NextResponse.json({
        ...feed,
        initialArticlesCount: 0,
        warning: 'Feed created but initial article fetch failed. You can try refreshing manually.',
      }, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating feed:', error);
    return NextResponse.json({ error: 'Failed to create feed' }, { status: 500 });
  }
}