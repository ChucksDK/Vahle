import { PrismaClient } from '@prisma/client';
import { fetchFeedArticles } from '../src/lib/rss-parser';
import { evaluateArticle } from '../src/lib/ai-evaluator';

const prisma = new PrismaClient();

async function fetchAllFeeds() {
  console.log('Starting RSS feed fetch process...');

  try {
    const feeds = await prisma.feed.findMany({
      where: { isActive: true },
    });

    console.log(`Found ${feeds.length} active feeds to process`);

    let totalNewArticles = 0;
    let totalUpdatedArticles = 0;
    let totalErrors = 0;

    for (const feed of feeds) {
      console.log(`Processing feed: ${feed.name} (${feed.url})`);

      try {
        const articles = await fetchFeedArticles(feed.url);
        let newArticlesCount = 0;
        let updatedArticlesCount = 0;

        for (const article of articles) {
          try {
            const existingArticle = await prisma.article.findUnique({
              where: { link: article.link },
            });

            if (!existingArticle) {
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
              console.log(`  ✅ Added: ${article.title.substring(0, 60)}...`);
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
              console.log(`  📝 Updated: ${article.title.substring(0, 60)}...`);
            }
          } catch (articleError) {
            console.error(`    ❌ Error processing article: ${article.title}`, articleError);
            totalErrors++;
          }
        }

        await prisma.feed.update({
          where: { id: feed.id },
          data: { lastFetched: new Date() },
        });

        totalNewArticles += newArticlesCount;
        totalUpdatedArticles += updatedArticlesCount;

        console.log(`  📊 Feed summary: ${newArticlesCount} new, ${updatedArticlesCount} updated`);
        
      } catch (feedError) {
        console.error(`❌ Error processing feed ${feed.name}:`, feedError);
        totalErrors++;
      }
    }

    console.log('\n📊 Process Summary:');
    console.log(`✅ New articles: ${totalNewArticles}`);
    console.log(`📝 Updated articles: ${totalUpdatedArticles}`);
    console.log(`❌ Errors: ${totalErrors}`);
    console.log('🎉 Feed fetch process completed!\n');

  } catch (error) {
    console.error('💥 Fatal error during feed fetch:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fetchAllFeeds();
}