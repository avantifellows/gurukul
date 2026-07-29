import { cookies } from 'next/headers';

const PORTAL_BACKEND_URL = process.env.NEXT_PUBLIC_AF_PORTAL_BACKEND_URL || '';

const VERIFY_PATH = '/auth/verify';
const REFRESH_PATH = '/auth/refresh-token';
const CREATE_TOKEN_PATH = '/auth/create-access-token';

export const isLaunchConfigured = (): boolean => Boolean(PORTAL_BACKEND_URL);

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

/**
 * Resolve the signed-in student from the httpOnly portal auth cookies,
 * refreshing the access token once if it has gone stale.
 */
export async function resolvePortalSession(): Promise<VerifiedPortalToken | null> {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    const verifiedToken = accessToken ? await verifyPortalToken(accessToken) : null;
    if (verifiedToken) return verifiedToken;

    if (!refreshToken) return null;

    const refreshedAccessToken = await refreshAccessToken(refreshToken);
    return refreshedAccessToken ? verifyPortalToken(refreshedAccessToken) : null;
}

/**
 * Mint a short-lived launch token for the given audience, carrying the
 * student's canonical identifiers across to the destination app.
 */
export async function createLaunchToken(
    verifiedToken: VerifiedPortalToken,
    audience: 'quiz' | 'report'
): Promise<string | null> {
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
            audience,
        }),
        cache: 'no-store',
    });

    if (!response.ok) return null;
    const data = await response.json();
    return typeof data.access_token === 'string' ? data.access_token : null;
}

/**
 * Resolve a caller-supplied URL against a trusted base, rejecting anything
 * that points off-origin so the launch routes cannot become open redirects.
 */
export function resolveSameOriginUrl(rawUrl: string | null, baseUrl: string): URL | null {
    if (!rawUrl || !baseUrl) return null;

    try {
        const base = new URL(baseUrl);
        const resolved = new URL(rawUrl, base);
        return resolved.origin === base.origin ? resolved : null;
    } catch {
        return null;
    }
}
