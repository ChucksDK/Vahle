import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evaluateArticle } from '@/lib/ai-evaluator';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting evaluation of articles missing AI evaluations...');
    
    // Get all articles without AI evaluations
    const articlesWithoutEvaluations = await prisma.article.findMany({
      where: {
        aiEvaluation: null
      },
      include: {
        feed: {
          select: { name: true }
        }
      }
    });

    console.log(`Found ${articlesWithoutEvaluations.length} articles without evaluations`);

    let processedCount = 0;
    let errorCount = 0;

    for (const article of articlesWithoutEvaluations) {
      try {
        console.log(`Processing article ${processedCount + 1}/${articlesWithoutEvaluations.length}: "${article.title}" from ${article.feed.name}`);
        
        // Get AI evaluation
        const evaluation = await evaluateArticle(
          article.title,
          article.content,
          article.description
        );

        // Create the evaluation
        await prisma.aiEvaluation.create({
          data: {
            articleId: article.id,
            ...evaluation,
          },
        });

        processedCount++;
        console.log(`✓ Evaluated: Score ${evaluation.relevanceScore}, Priority ${evaluation.priority}`);
      } catch (error) {
        console.error(`✗ Error processing article ${article.id}:`, error);
        errorCount++;
      }
    }

    console.log('\n=== Missing Evaluations Summary ===');
    console.log(`Articles found without evaluations: ${articlesWithoutEvaluations.length}`);
    console.log(`Successfully evaluated: ${processedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('✓ Missing evaluations complete!');

    return NextResponse.json({
      message: 'Missing evaluations complete',
      articlesFound: articlesWithoutEvaluations.length,
      processedCount,
      errorCount,
    });

  } catch (error) {
    console.error('Fatal error during missing evaluations:', error);
    return NextResponse.json({ error: 'Failed to evaluate missing articles' }, { status: 500 });
  }
}