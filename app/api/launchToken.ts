import { cookies } from 'next/headers';

const PORTAL_BACKEND_URL = process.env.NEXT_PUBLIC_AF_PORTAL_BACKEND_URL || '';

const VERIFY_PATH = '/auth/verify';
const REFRESH_PATH = '/auth/refresh-token';
const LAUNCH_TOKEN_PATH = '/auth/launch-token';

export const isLaunchConfigured = (): boolean => Boolean(PORTAL_BACKEND_URL);

type VerifiedPortalToken = {
    id?: string | number;
    data?: Record<string, any>;
};

export type PortalSession = {
    token: VerifiedPortalToken;
    accessToken: string;
};

function bearerHeaders(token: string): HeadersInit {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
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

/**
 * Resolve the signed-in student from the httpOnly portal auth cookies,
 * refreshing the access token once if it has gone stale.
 */
export async function resolvePortalSession(): Promise<PortalSession | null> {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (accessToken) {
        const token = await verifyPortalToken(accessToken);
        if (token) return { token, accessToken };
    }

    if (!refreshToken) return null;

    const refreshedAccessToken = await refreshAccessToken(refreshToken);
    if (!refreshedAccessToken) return null;

    const token = await verifyPortalToken(refreshedAccessToken);
    return token ? { token, accessToken: refreshedAccessToken } : null;
}

/**
 * Ask portal-backend for a short-lived launch token for the given audience.
 * Claims are copied server-side from the verified access token.
 */
export async function createLaunchToken(
    session: PortalSession,
    audience: 'quiz' | 'report'
): Promise<string | null> {
    if (!PORTAL_BACKEND_URL || !session?.accessToken) {
        return null;
    }

    const response = await fetch(portalBackendUrl(LAUNCH_TOKEN_PATH), {
        method: 'POST',
        headers: {
            ...bearerHeaders(session.accessToken),
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ audience }),
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
