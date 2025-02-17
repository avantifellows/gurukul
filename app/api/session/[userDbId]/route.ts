import { NextResponse } from 'next/server';
import { RedisService } from '@/services/RedisService';

export async function GET(req: Request, { params }: { params: { userDbId: string } }) {
  const { userDbId } = params;

  try {
    const redisService = RedisService.getInstance();

    const sessionData = await redisService.getUserSessionData(Number(userDbId), {
      includeQuizzes: true,
      includeLiveClasses: true,
    });

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json({ error: 'Failed to fetch session data' }, { status: 500 });
  }
}
