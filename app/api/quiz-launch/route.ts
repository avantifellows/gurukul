import { NextRequest, NextResponse } from 'next/server';
import {
    createLaunchToken,
    isLaunchConfigured,
    resolvePortalSession,
    resolveSameOriginUrl,
} from '../launchToken';

const QUIZ_BASE_URL =
    process.env.NEXT_PUBLIC_AF_QUIZ_URL || 'https://quiz.avantifellows.org/quiz/';
const QUIZ_API_KEY = process.env.NEXT_PUBLIC_AF_QUIZ_API_KEY || '';

export async function GET(request: NextRequest) {
    if (!isLaunchConfigured() || !QUIZ_API_KEY) {
        return NextResponse.json({ error: 'Quiz launch is not configured' }, { status: 500 });
    }

    const quizUrl = resolveSameOriginUrl(request.nextUrl.searchParams.get('url'), QUIZ_BASE_URL);
    if (!quizUrl) {
        return NextResponse.json({ error: 'Invalid quiz URL' }, { status: 400 });
    }

    const verifiedToken = await resolvePortalSession();
    if (!verifiedToken) {
        return NextResponse.json({ error: 'Unable to verify Gurukul session' }, { status: 401 });
    }

    const launchToken = await createLaunchToken(verifiedToken, 'quiz');
    if (!launchToken) {
        return NextResponse.json({ error: 'Unable to create quiz launch token' }, { status: 502 });
    }

    quizUrl.searchParams.set('apiKey', QUIZ_API_KEY);
    quizUrl.searchParams.set('launchToken', launchToken);
    quizUrl.searchParams.delete('userId');

    const response = NextResponse.redirect(quizUrl);
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
