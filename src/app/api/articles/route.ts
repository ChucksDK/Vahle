import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const feedId = searchParams.get('feedId');
    const isRead = searchParams.get('isRead');
    const sort = searchParams.get('sort') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (feedId) {
      where.feedId = feedId;
    }

    if (isRead !== null) {
      where.isRead = isRead === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const now = new Date();
    switch (filter) {
      case 'today':
        where.pubDate = {
          gte: startOfDay(now),
          lte: endOfDay(now),
        };
        break;
      case 'week':
        where.pubDate = {
          gte: startOfWeek(now, { weekStartsOn: 1 }),
          lte: endOfWeek(now, { weekStartsOn: 1 }),
        };
        break;
      case 'month':
        where.pubDate = {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        };
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        where.pubDate = {
          gte: startOfMonth(lastMonth),
          lte: endOfMonth(lastMonth),
        };
        break;
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          feed: true,
          aiEvaluation: true,
        },
        orderBy: [
          { 
            aiEvaluation: { 
              relevanceScore: sort as 'asc' | 'desc'
            } 
          },
          { pubDate: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}