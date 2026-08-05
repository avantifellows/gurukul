/**
 * The reports listing hands us links of the form
 *   /reports/student_quiz_report/{session_id}/{user_id}
 * which are unauthenticated and therefore render without a "Review Quiz"
 * button. Reporting only exposes that button when it can resolve the student
 * from a launch token, which it accepts on the session-only route:
 *   /reports/student_quiz_report/{session_id}?launchToken=...
 * Drop the trailing user_id so the token becomes the source of identity.
 *
 * Lives outside route.ts because Next.js only allows HTTP verb exports from a
 * route module, and this needs to be importable by tests.
 */
export function toLaunchPath(pathname: string): string | null {
    const match = pathname.match(/^(.*\/student_quiz_report(?:\/v3)?)\/([^/]+)\/([^/]+)\/?$/);
    if (!match) return null;

    const [, prefix, sessionId] = match;
    return `${prefix}/${sessionId}`;
}
