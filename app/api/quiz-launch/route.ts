import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const PORTAL_BACKEND_URL = process.env.NEXT_PUBLIC_AF_PORTAL_BACKEND_URL || '';
const QUIZ_BASE_URL =
    process.env.NEXT_PUBLIC_AF_QUIZ_URL || 'https://quiz.avantifellows.org/quiz/';
const QUIZ_API_KEY = process.env.NEXT_PUBLIC_AF_QUIZ_API_KEY || '';

const VERIFY_PATH = '/auth/verify';
const REFRESH_PATH = '/auth/refresh-token';
const CREATE_TOKEN_PATH = '/auth/create-access-token';

type VerifiedPortalToken = {
    id?: string | number;
    data?: Record<string, any>;
};

function bearerHeaders(token: string): HeadersInit {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
    };
}

function jsonHeaders(): HeadersInit {
    return {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    };
}

function portalBackendUrl(path: string): string {
    return `${PORTAL_BACKEND_URL.replace(/\/$/, '')}${path}`;
}

async function verifyPortalToken(token: string): Promise<VerifiedPortalToken | null> {
    const response = await fetch(portalBackendUrl(VERIFY_PATH), {
        headers: bearerHeaders(token),
        cache: 'no-store',
    });

    if (!response.ok) return null;
    return response.json();
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
    const response = await fetch(portalBackendUrl(REFRESH_PATH), {
        method: 'POST',
        headers: bearerHeaders(refreshToken),
        cache: 'no-store',
    });

    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.access_token === 'string' ? data.access_token : null;
}

function buildLaunchData(tokenData: Record<string, any>, canonicalUserId: string) {
    const launchData: Record<string, any> = {
        group: tokenData.group,
        user_id: canonicalUserId,
    };

    for (const key of [
        'student_id',
        'apaar_id',
        'teacher_id',
        'candidate_id',
        'school_code',
        'display_id',
        'display_id_type',
        'profile',
        'user_type',
    ]) {
        if (tokenData[key] !== undefined && tokenData[key] !== null) {
            launchData[key] = tokenData[key];
        }
    }

    return launchData;
}

async function createQuizLaunchToken(verifiedToken: VerifiedPortalToken): Promise<string | null> {
    const tokenData = verifiedToken.data || {};
    const canonicalUserId = String(tokenData.user_id ?? verifiedToken.id ?? '');

    if (!PORTAL_BACKEND_URL || !canonicalUserId || !tokenData.group) {
        return null;
    }

    const response = await fetch(portalBackendUrl(CREATE_TOKEN_PATH), {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify({
            type: 'user',
            is_user_valid: true,
            id: canonicalUserId,
            data: buildLaunchData(tokenData, canonicalUserId),
            session_mode: 'launch',
            audience: 'quiz',
        }),
        cache: 'no-store',
    });

    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.access_token === 'string' ? data.access_token : null;
}

function resolveQuizUrl(rawUrl: string | null): URL | null {
    if (!rawUrl) return null;

    const quizBase = new URL(QUIZ_BASE_URL);
    const quizUrl = new URL(rawUrl, quizBase);

    if (quizUrl.origin !== quizBase.origin) {
        return null;
    }

    return quizUrl;
}

export async function GET(request: NextRequest) {
    if (!PORTAL_BACKEND_URL || !QUIZ_API_KEY) {
        return NextResponse.json({ error: 'Quiz launch is not configured' }, { status: 500 });
    }

    const quizUrl = resolveQuizUrl(request.nextUrl.searchParams.get('url'));
    if (!quizUrl) {
        return NextResponse.json({ error: 'Invalid quiz URL' }, { status: 400 });
    }

    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    let verifiedToken = accessToken ? await verifyPortalToken(accessToken) : null;

    if (!verifiedToken && refreshToken) {
        const refreshedAccessToken = await refreshAccessToken(refreshToken);
        verifiedToken = refreshedAccessToken
            ? await verifyPortalToken(refreshedAccessToken)
            : null;
    }

    if (!verifiedToken) {
        return NextResponse.json({ error: 'Unable to verify Gurukul session' }, { status: 401 });
    }

    const launchToken = await createQuizLaunchToken(verifiedToken);
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
