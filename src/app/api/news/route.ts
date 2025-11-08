import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [['media:content', 'media:content', { keepArray: false }]],
  },
});

export async function GET() {
  try {
    const feed = await parser.parseURL(
      'https://www.espncricinfo.com/rss/content/story/feeds/0.xml',
    );

    // Transform feed items to a cleaner format
    const newsItems = feed.items.map((item: any) => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || '',
      contentSnippet: item.contentSnippet || '',
      content: item.content || '',
      guid: item.guid || '',
      image: item['media:content']?.$?.url || item.enclosure?.url || null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        title: feed.title || 'ESPN Cricinfo News',
        description: feed.description || '',
        link: feed.link || '',
        items: newsItems,
      },
    });
  } catch (error) {
    console.error(
      'Error fetching cricket news:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cricket news',
      },
      { status: 500 },
    );
  }
}
