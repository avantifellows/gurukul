import { resolvePortalSession } from '@/app/api/launchToken';

export interface SessionIdentity {
    // The signed-in user's id, taken from the verified token's subject.
    userId: string;
    // Auth group from the token (e.g. a teacher group), or null when absent.
    group: string | null;
    // The full verified token payload, for callers that need other claims.
    data: Record<string, any>;
}

/**
 * Resolve and verify the signed-in user from the auth cookies, server-side.
 *
 * A "use server" action is a public HTTP endpoint: anyone can POST to it with
 * any arguments, regardless of what the client renders or whether they are
 * logged in. So any action that returns personal or user-scoped data must
 * establish identity HERE — from the signed token in the httpOnly-style auth
 * cookie — and never trust a user id passed in by the caller.
 *
 * Throws when there is no valid session, so a caller can never proceed
 * unauthenticated. Callers that prefer to degrade gracefully (e.g. return
 * neutral defaults) should call this inside their own try/catch.
 */
export async function requireSession(): Promise<SessionIdentity> {
    const session = await resolvePortalSession();
    const data = session?.token?.data ?? {};
    const userId =
        session?.token?.id != null
            ? String(session.token.id)
            : data.user_id != null
              ? String(data.user_id)
              : null;

    if (!session || !userId) {
        throw new Error('Unauthorized');
    }

    return { userId, group: data.group ?? null, data };
}
