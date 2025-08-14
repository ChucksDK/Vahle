import Parser from 'rss-parser';
import axios from 'axios';
import * as cheerio from 'cheerio';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
    ]
  },
  headers: {
    'Accept': 'application/rss+xml, application/xml, text/xml',
    'Accept-Charset': 'utf-8',
    'User-Agent': 'Mozilla/5.0 (compatible; RSS-Sales-Intelligence/1.0)'
  }
});

export interface ParsedArticle {
  title: string;
  description?: string;
  content?: string;
  link: string;
  guid?: string;
  pubDate?: Date;
  author?: string;
  imageUrl?: string;
}

// Helper function to fix encoding issues common in RSS feeds
function fixEncoding(text: string | undefined | null): string | undefined {
  if (!text) return text || undefined;
  
  // Fix common UTF-8 encoding issues
  return text
    .replace(/Ã¦/g, 'æ')  // ae ligature
    .replace(/Ã¸/g, 'ø')  // o with stroke
    .replace(/Ã¥/g, 'å')  // a with ring
    .replace(/Ã†/g, 'Æ')  // AE ligature
    .replace(/Ã˜/g, 'Ø')  // O with stroke
    .replace(/Ã…/g, 'Å')  // A with ring
    .replace(/â€™/g, "'") // right single quotation mark
    .replace(/â€œ/g, '"') // left double quotation mark
    .replace(/â€/g, '"')  // right double quotation mark
    .replace(/â€"/g, '–') // en dash
    .replace(/â€"/g, '—') // em dash
    .replace(/Â /g, ' ')   // non-breaking space
    .replace(/Â/g, '')    // remove standalone Â
    .trim();
}

// Helper function to clean promotional/subscription content from articles
function cleanContent(text: string | undefined | null): string | undefined {
  if (!text || text.length < 20) return text || undefined; // Don't process very short texts
  
  // Remove Building Supply DK subscription promotional text - be more specific
  let cleanedText = text;
  
  // Only remove the specific promotional block at the end of articles
  cleanedText = cleanedText.replace(/\s*Vil du have det hele med\?\s*Prøv 30 dage for 0 kr\.\s*Ingen binding eller kortoplysninger påkrævet\.\s*Prøv nu\s*Køb et abonnement\s*Udforsk vores abonnementer, og vælg den løsning, der matcher dine behov\.\s*Vælg dit abonnement\s*Log ind\s*$/gi, '');
  
  return cleanedText.trim() || text || undefined; // Return original if cleaning results in empty string
}

export async function validateRssFeed(url: string): Promise<boolean> {
  try {
    await parser.parseURL(url);
    return true;
  } catch (error) {
    return false;
  }
}

export async function fetchFeedArticles(
  feedUrl: string, 
  hoursBack: number = 24
): Promise<ParsedArticle[]> {
  try {
    console.log(`\n=== Fetching RSS feed: ${feedUrl} ===`);
    const feed = await parser.parseURL(feedUrl);
    const articles: ParsedArticle[] = [];
    
    // Calculate the cutoff date (24 hours ago by default)
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hoursBack);
    
    console.log(`Feed contains ${feed.items.length} total items`);
    console.log(`Cutoff date: ${cutoffDate.toISOString()} (articles from last ${hoursBack} hours)`);

    for (const item of feed.items) {
      let imageUrl: string | undefined;
      
      if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url;
      } else if ((item as any).media?.['$']?.url) {
        imageUrl = (item as any).media['$'].url;
      } else if (item.content || (item as any).contentEncoded) {
        const $ = cheerio.load(item.content || (item as any).contentEncoded || '');
        const firstImg = $('img').first();
        if (firstImg.length) {
          imageUrl = firstImg.attr('src');
        }
      }

      const article: ParsedArticle = {
        title: fixEncoding(item.title) || 'Untitled',
        description: fixEncoding(item.contentSnippet || item.summary),
        content: cleanContent(fixEncoding((item as any).contentEncoded || item.content)),
        link: item.link || '',
        guid: item.guid || item.link,
        pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
        author: fixEncoding((item as any).creator || (item as any).author),
        imageUrl,
      };

      // Filter articles by date - only include articles from within the specified time frame
      if (article.pubDate && article.pubDate < cutoffDate) {
        console.log(`Skipping article '${article.title}' - published ${article.pubDate.toISOString()} is before cutoff ${cutoffDate.toISOString()}`);
        continue; // Skip articles older than the cutoff
      }

      // If no pubDate, include it (some feeds might not have proper dates)
      if (!article.pubDate) {
        console.log(`Including article '${article.title}' - no publication date available`);
      } else {
        console.log(`Including article '${article.title}' - published ${article.pubDate.toISOString()}`);
      }

      // Only fetch full content if we have no description AND no content
      // (Disabled for now to prevent timeouts - can be re-enabled later with better optimization)
      /*
      if ((!article.content && !article.description) && article.link) {
        try {
          const fullContent = await fetchFullContent(article.link);
          if (fullContent) {
            article.content = fullContent;
          }
        } catch (error) {
          console.error(`Failed to fetch full content for ${article.link}:`, error);
        }
      }
      */

      articles.push(article);
    }

    console.log(`Fetched ${articles.length} articles from the last ${hoursBack} hours out of ${feed.items.length} total items from feed: ${feedUrl}`);
    return articles;
  } catch (error) {
    console.error(`Error fetching RSS feed ${feedUrl}:`, error);
    throw error;
  }
}

async function fetchFullContent(url: string): Promise<string | undefined> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Sales-Intelligence/1.0)',
        'Accept-Charset': 'utf-8'
      },
      responseType: 'text',
      responseEncoding: 'utf8'
    });
    
    const $ = cheerio.load(response.data);
    
    $('script, style, nav, header, footer, aside').remove();
    
    const selectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
      '#content',
      '.article-body',
      '.article-content',
      '.news-content',
      '.text-content',
      '.body-text',
      '.artikel'
    ];
    
    for (const selector of selectors) {
      const content = $(selector).first();
      if (content.length && content.text().trim().length > 100) {
        return content.html() || undefined;
      }
    }
    
    const body = $('body');
    if (body.length) {
      return body.html() || undefined;
    }
    
    return undefined;
  } catch (error) {
    console.error(`Error fetching full content from ${url}:`, error);
    return undefined;
  }
}