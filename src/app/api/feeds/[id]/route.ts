import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateFeedSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const feed = await prisma.feed.findUnique({
      where: { id: params.id },
      include: {
        articles: {
          orderBy: { pubDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!feed) {
      return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
    }

    return NextResponse.json(feed);
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updateFeedSchema.parse(body);

    const feed = await prisma.feed.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(feed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating feed:', error);
    return NextResponse.json({ error: 'Failed to update feed' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.feed.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Feed deleted successfully' });
  } catch (error) {
    console.error('Error deleting feed:', error);
    return NextResponse.json({ error: 'Failed to delete feed' }, { status: 500 });
  }
}