const Parser = require('rss-parser');

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media'],
      ['content:encoded', 'contentEncoded'],
    ]
  }
});

async function testRssFeed() {
  try {
    console.log('Testing RSS feed...');
    const feed = await parser.parseURL('https://www.building-supply.dk/xml/rss2/articles');
    
    console.log('Feed title:', feed.title);
    console.log('Number of items:', feed.items.length);
    
    if (feed.items.length > 0) {
      const firstItem = feed.items[0];
      console.log('\nFirst item:');
      console.log('Title:', firstItem.title);
      console.log('Link:', firstItem.link);
      console.log('Description:', firstItem.description || 'EMPTY');
      console.log('Content:', firstItem.content || 'EMPTY');
      console.log('Content Snippet:', firstItem.contentSnippet || 'EMPTY');
      console.log('Summary:', firstItem.summary || 'EMPTY');
      console.log('Pub Date:', firstItem.pubDate);
      console.log('GUID:', firstItem.guid);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testRssFeed();