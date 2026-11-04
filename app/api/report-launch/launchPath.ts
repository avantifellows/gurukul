/**
 * The reports listing hands us links of the form
 *   /reports/student_quiz_report/{session_id}/{user_id}
 * which are unauthenticated and therefore render without a "Review Quiz"
 * button. Reporting only exposes that button when it can resolve the student
 * from a launch token, which it accepts on the session-only route:
 *   /reports/student_quiz_report/{session_id}?launchToken=...
 * Drop the trailing user_id so the token becomes the source of identity.
 *
 * The cumulative report is handled the same way: /reports/cumulative_report.
 *
 * Lives outside route.ts because Next.js only allows HTTP verb exports from a
 * route module, and this needs to be importable by tests.
 */
export function toLaunchPath(pathname: string): string | null {
    // The cumulative report (a student's last big tests) has no session, so the
    // token route is just /reports/cumulative_report. Any user_id is dropped.
    const cumulative = pathname.match(/^(.*\/cumulative_report)(?:\/[^/]+)?\/?$/);
    if (cumulative) return cumulative[1];

    const match = pathname.match(/^(.*\/student_quiz_report(?:\/v3)?)\/([^/]+)\/([^/]+)\/?$/);
    if (!match) return null;

    const [, prefix, sessionId] = match;
    return `${prefix}/${sessionId}`;
}
