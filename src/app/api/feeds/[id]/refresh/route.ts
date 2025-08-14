import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fetchFeedArticles } from '@/lib/rss-parser';
import { evaluateArticle } from '@/lib/ai-evaluator';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feed = await prisma.feed.findUnique({
      where: { id: params.id },
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    const articles = await fetchFeedArticles(feed.url, 24); // Fetch articles from last 24 hours
    let newArticlesCount = 0;
    let updatedArticlesCount = 0;

    for (const article of articles) {
      if (!article.link) {
        continue; // Skip articles without links
      }

      const existingArticle = await prisma.article.findUnique({
        where: { link: article.link },
      });

      if (!existingArticle) {
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
            throw createError;
          }
        }
      } else if (article.content && !existingArticle.content) {
        await prisma.article.update({
          where: { id: existingArticle.id },
          data: { content: article.content },
        });

        const existingEvaluation = await prisma.aiEvaluation.findUnique({
          where: { articleId: existingArticle.id },
        });

        if (!existingEvaluation) {
          const evaluation = await evaluateArticle(
            article.title,
            article.content,
            article.description
          );

          await prisma.aiEvaluation.create({
            data: {
              articleId: existingArticle.id,
              ...evaluation,
            },
          });
        }

        updatedArticlesCount++;
      }
    }

    await prisma.feed.update({
      where: { id: feed.id },
      data: { lastFetched: new Date() },
    });

    return NextResponse.json({
      message: 'Feed refreshed successfully',
      newArticles: newArticlesCount,
      updatedArticles: updatedArticlesCount,
    });
  } catch (error) {
    console.error('Error refreshing feed:', error);
    return NextResponse.json({ error: 'Failed to refresh feed' }, { status: 500 });
  }
}