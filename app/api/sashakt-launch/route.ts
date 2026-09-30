import { NextRequest, NextResponse } from 'next/server';
import { isLaunchConfigured, resolvePortalSession } from '../launchToken';

const PORTAL_BACKEND_URL = process.env.NEXT_PUBLIC_AF_PORTAL_BACKEND_URL || '';
const SASHAKT_BASE_URL =
    process.env.NEXT_PUBLIC_AF_SASHAKT_URL || 'https://sashakt.projecttech4dev.org';

/**
 * Pull the test link uuid out of a Sashakt url (.../test/<uuid>).
 * Returns null for anything that is not a Sashakt test url, so a resource
 * pointing somewhere unexpected is refused rather than forwarded.
 */
function resolveTestLinkUuid(rawUrl: string | null): string | null {
    if (!rawUrl || !SASHAKT_BASE_URL) return null;
    try {
        const base = new URL(SASHAKT_BASE_URL);
        const url = new URL(rawUrl, base);
        if (url.origin !== base.origin) return null;
        const match = url.pathname.match(/\/test\/([^/]+)\/?$/);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    if (!isLaunchConfigured()) {
        return NextResponse.json({ error: 'Sashakt launch is not configured' }, { status: 500 });
    }

    const testLinkUuid = resolveTestLinkUuid(request.nextUrl.searchParams.get('url'));
    if (!testLinkUuid) {
        return NextResponse.json({ error: 'Invalid Sashakt URL' }, { status: 400 });
    }

    const verifiedToken = await resolvePortalSession();
    if (!verifiedToken) {
        return NextResponse.json({ error: 'Unable to verify Gurukul session' }, { status: 401 });
    }

    const tokenData = verifiedToken.token.data || {};
    const userId = String(tokenData.user_id ?? verifiedToken.token.id ?? '');
    if (!userId) {
        return NextResponse.json({ error: 'Unable to resolve the student' }, { status: 401 });
    }

    // Sashakt maps one candidate per (organization, external id), so portal can
    // be called on every launch and the student keeps the same attempt.
    const launch = await fetch(`${PORTAL_BACKEND_URL.replace(/\/$/, '')}/sashakt/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ user_id: userId, test_link_uuid: testLinkUuid }),
    });

    if (!launch.ok) {
        return NextResponse.json({ error: 'Unable to create Sashakt launch' }, { status: 502 });
    }

    const launchUrl = (await launch.json())?.launch_url;
    if (!launchUrl) {
        return NextResponse.json({ error: 'Unable to create Sashakt launch' }, { status: 502 });
    }

    const response = NextResponse.redirect(launchUrl);
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
