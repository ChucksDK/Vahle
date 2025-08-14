import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateArticle } from '@/lib/ai-evaluator';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting re-evaluation of all articles...');
    
    // Get all articles
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
      },
    });

    console.log(`Found ${articles.length} articles to re-evaluate`);

    let processedCount = 0;
    let errorCount = 0;

    for (const article of articles) {
      try {
        console.log(`Processing article ${processedCount + 1}/${articles.length}: ${article.title}`);
        
        // Get new evaluation
        const evaluation = await evaluateArticle(
          article.title,
          article.content,
          article.description
        );

        // Delete existing evaluation if it exists
        await prisma.aiEvaluation.deleteMany({
          where: { articleId: article.id },
        });

        // Create new evaluation
        await prisma.aiEvaluation.create({
          data: {
            articleId: article.id,
            ...evaluation,
          },
        });

        processedCount++;
        console.log(`✓ Re-evaluated: Score ${evaluation.relevanceScore}, Priority ${evaluation.priority}`);
      } catch (error) {
        console.error(`✗ Error processing article ${article.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Re-evaluation Summary ===');
    console.log(`Total articles: ${articles.length}`);
    console.log(`Successfully processed: ${processedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('✓ Re-evaluation complete!');

    return NextResponse.json({
      message: 'Re-evaluation complete',
      totalArticles: articles.length,
      processedCount,
      errorCount,
    });

  } catch (error) {
    console.error('Fatal error during re-evaluation:', error);
    return NextResponse.json({ error: 'Failed to re-evaluate articles' }, { status: 500 });
  }
}