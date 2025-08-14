import { NextResponse } from 'next/server';
import { startCronJobs } from '@/lib/cron';

export async function POST() {
  try {
    startCronJobs();
    return NextResponse.json({ message: 'Cron jobs started successfully' });
  } catch (error) {
    console.error('Error starting cron jobs:', error);
    return NextResponse.json({ error: 'Failed to start cron jobs' }, { status: 500 });
  }
}