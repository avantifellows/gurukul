import { NextRequest, NextResponse } from 'next/server';
import {
    createLaunchToken,
    isLaunchConfigured,
    resolvePortalSession,
    resolveSameOriginUrl,
} from '../launchToken';

const REPORTS_URL = process.env.AF_REPORTS_URL || '';

/**
 * The reports listing hands us links of the form
 *   /reports/student_quiz_report/{session_id}/{user_id}
 * which are unauthenticated and therefore render without a "Review Quiz"
 * button. Reporting only exposes that button when it can resolve the student
 * from a launch token, which it accepts on the session-only route:
 *   /reports/student_quiz_report/{session_id}?launchToken=...
 * Drop the trailing user_id so the token becomes the source of identity.
 */
function toLaunchPath(pathname: string): string | null {
    const match = pathname.match(/^(.*\/student_quiz_report(?:\/v3)?)\/([^/]+)\/([^/]+)\/?$/);
    if (!match) return null;

    const [, prefix, sessionId] = match;
    return `${prefix}/${sessionId}`;
}

export async function GET(request: NextRequest) {
    if (!isLaunchConfigured() || !REPORTS_URL) {
        return NextResponse.json({ error: 'Report launch is not configured' }, { status: 500 });
    }

    const reportUrl = resolveSameOriginUrl(request.nextUrl.searchParams.get('url'), REPORTS_URL);
    if (!reportUrl) {
        return NextResponse.json({ error: 'Invalid report URL' }, { status: 400 });
    }

    const launchPath = toLaunchPath(reportUrl.pathname);
    if (!launchPath) {
        return NextResponse.json({ error: 'Unsupported report URL' }, { status: 400 });
    }

    const verifiedToken = await resolvePortalSession();
    if (!verifiedToken) {
        return NextResponse.json({ error: 'Unable to verify Gurukul session' }, { status: 401 });
    }

    const launchToken = await createLaunchToken(verifiedToken, 'report');
    if (!launchToken) {
        return NextResponse.json({ error: 'Unable to create report launch token' }, { status: 502 });
    }

    reportUrl.pathname = launchPath;
    reportUrl.searchParams.set('launchToken', launchToken);

    const response = NextResponse.redirect(reportUrl);
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
