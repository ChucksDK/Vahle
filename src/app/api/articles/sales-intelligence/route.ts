import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const minScore = parseInt(searchParams.get('minScore') || '60');
    const sort = searchParams.get('sort') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const articles = await prisma.article.findMany({
      where: {
        aiEvaluation: {
          relevanceScore: {
            gte: minScore,
          },
        },
      },
      include: {
        feed: true,
        aiEvaluation: true,
      },
      orderBy: {
        aiEvaluation: {
          relevanceScore: sort as 'asc' | 'desc',
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.article.count({
      where: {
        aiEvaluation: {
          relevanceScore: {
            gte: minScore,
          },
        },
      },
    });

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
    console.error('Error fetching sales intelligence:', error);
    return NextResponse.json({ error: 'Failed to fetch sales intelligence' }, { status: 500 });
  }
}