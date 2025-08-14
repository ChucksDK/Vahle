import * as cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { fetchFeedArticles } from './rss-parser';
import { evaluateArticle } from './ai-evaluator';

const prisma = new PrismaClient();

export function startCronJobs() {
  cron.schedule('*/30 * * * *', async () => {
    console.log('🔄 Starting scheduled RSS feed fetch...');
    
    try {
      const feeds = await prisma.feed.findMany({
        where: { isActive: true },
      });

      let totalNewArticles = 0;
      let totalErrors = 0;

      for (const feed of feeds) {
        try {
          const articles = await fetchFeedArticles(feed.url);
          let newArticlesCount = 0;

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
              }
            } catch (articleError) {
              console.error(`Error processing article: ${article.title}`, articleError);
              totalErrors++;
            }
          }

          await prisma.feed.update({
            where: { id: feed.id },
            data: { lastFetched: new Date() },
          });

          totalNewArticles += newArticlesCount;

          if (newArticlesCount > 0) {
            console.log(`📰 ${feed.name}: ${newArticlesCount} new articles`);
          }
          
        } catch (feedError) {
          console.error(`Error processing feed ${feed.name}:`, feedError);
          totalErrors++;
        }
      }

      if (totalNewArticles > 0 || totalErrors > 0) {
        console.log(`✅ Scheduled fetch complete: ${totalNewArticles} new articles, ${totalErrors} errors`);
      }

    } catch (error) {
      console.error('Error during scheduled feed fetch:', error);
    }
  }, {
    scheduled: false
  });

  console.log('⏰ Cron job scheduled: RSS feeds will be fetched every 30 minutes');
}