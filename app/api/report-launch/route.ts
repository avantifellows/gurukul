import { NextRequest, NextResponse } from 'next/server';
import {
    createLaunchToken,
    isLaunchConfigured,
    resolvePortalSession,
    resolveSameOriginUrl,
} from '../launchToken';
import { toLaunchPath } from './launchPath';

// The public origin students browse, which is what the reports listing embeds in
// report_link. Deliberately NOT AF_REPORTS_URL: that is Gurukul's server-side
// API base (an API Gateway host), so validating against it would reject every
// real report link.
const REPORTS_PUBLIC_URL =
    process.env.NEXT_PUBLIC_AF_REPORTS_URL || 'https://reports.avantifellows.org';

export async function GET(request: NextRequest) {
    if (!isLaunchConfigured()) {
        return NextResponse.json({ error: 'Report launch is not configured' }, { status: 500 });
    }

    const reportUrl = resolveSameOriginUrl(
        request.nextUrl.searchParams.get('url'),
        REPORTS_PUBLIC_URL
    );
    if (!reportUrl) {
        return NextResponse.json({ error: 'Invalid report URL' }, { status: 400 });
    }

    const launchPath = toLaunchPath(reportUrl.pathname);
    if (!launchPath) {
        return NextResponse.json({ error: 'Unsupported report URL' }, { status: 400 });
    }

    const session = await resolvePortalSession();
    if (!session) {
        return NextResponse.json({ error: 'Unable to verify Gurukul session' }, { status: 401 });
    }

    const launchToken = await createLaunchToken(session, 'report');
    if (!launchToken) {
        return NextResponse.json({ error: 'Unable to create report launch token' }, { status: 502 });
    }

    reportUrl.pathname = launchPath;
    reportUrl.searchParams.set('launchToken', launchToken);

    const response = NextResponse.redirect(reportUrl);
    response.headers.set('Cache-Control', 'no-store');
    return response;
}
