const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMissingEvaluations() {
  try {
    // Get all articles with their evaluations
    const articlesWithEvaluations = await prisma.article.findMany({
      include: {
        aiEvaluation: true,
        feed: {
          select: { name: true }
        }
      }
    });

    console.log(`\n=== Articles Missing AI Evaluations ===`);
    console.log(`Total articles in database: ${articlesWithEvaluations.length}`);

    let missingCount = 0;
    const missingByFeed = {};

    articlesWithEvaluations.forEach(article => {
      if (!article.aiEvaluation) {
        missingCount++;
        const feedName = article.feed.name;
        if (!missingByFeed[feedName]) {
          missingByFeed[feedName] = [];
        }
        missingByFeed[feedName].push({
          id: article.id,
          title: article.title,
          pubDate: article.pubDate
        });
      }
    });

    console.log(`Articles missing evaluations: ${missingCount}`);
    console.log(`Articles with evaluations: ${articlesWithEvaluations.length - missingCount}`);

    if (missingCount > 0) {
      console.log(`\n=== Breakdown by Feed ===`);
      for (const [feedName, articles] of Object.entries(missingByFeed)) {
        console.log(`\n${feedName}: ${articles.length} missing evaluations`);
        articles.forEach(article => {
          console.log(`  - ${article.title} (${article.pubDate || 'No date'})`);
        });
      }
    } else {
      console.log(`\n✅ All articles have AI evaluations!`);
    }

  } catch (error) {
    console.error('Error checking evaluations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissingEvaluations();