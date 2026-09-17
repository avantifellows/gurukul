import { describe, expect, it, vi } from 'vitest';
import { resolveSameOriginUrl } from './launchToken';

const REPORTS = 'https://reports.avantifellows.org';

describe('resolveSameOriginUrl', () => {
    it('accepts a link on the trusted origin', () => {
        const resolved = resolveSameOriginUrl(`${REPORTS}/reports/student_quiz_report/S1/U1`, REPORTS);
        expect(resolved?.pathname).toBe('/reports/student_quiz_report/S1/U1');
    });

    // Keeps the launch route from becoming an open redirect. The look-alike
    // host ends with the trusted host but is not it, so a hostname suffix
    // check would wrongly let it through.
    it('rejects off-origin links', () => {
        expect(resolveSameOriginUrl('https://evil.example.com/r', REPORTS)).toBeNull();
        expect(resolveSameOriginUrl('https://evilreports.avantifellows.org/r', REPORTS)).toBeNull();
        expect(resolveSameOriginUrl('//evil.example.com/r', REPORTS)).toBeNull();
    });

    it('returns null rather than throwing on missing or unparseable input', () => {
        expect(resolveSameOriginUrl(null, REPORTS)).toBeNull();
        expect(resolveSameOriginUrl('http://', REPORTS)).toBeNull();
    });
});

describe('createLaunchToken', () => {
    const session = { token: { id: '42', data: { group: 'DelhiStudents' } }, accessToken: 'access.jwt' };

    it('asks portal-backend for a launch token using the verified access token', async () => {
        vi.stubEnv('NEXT_PUBLIC_AF_PORTAL_BACKEND_URL', 'https://portal-backend.test/');
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ access_token: 'launch.jwt', session_mode: 'launch' }),
        });
        vi.stubGlobal('fetch', fetchMock);

        vi.resetModules();
        const { createLaunchToken } = await import('./launchToken');
        await expect(createLaunchToken(session, 'quiz')).resolves.toBe('launch.jwt');

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://portal-backend.test/auth/launch-token');
        expect(init.method).toBe('POST');
        expect(init.headers.Authorization).toBe('Bearer access.jwt');
        expect(JSON.parse(init.body)).toEqual({ audience: 'quiz' });
    });

    it('returns null when portal-backend rejects the request', async () => {
        vi.stubEnv('NEXT_PUBLIC_AF_PORTAL_BACKEND_URL', 'https://portal-backend.test/');
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) }));

        vi.resetModules();
        const { createLaunchToken } = await import('./launchToken');
        await expect(createLaunchToken(session, 'report')).resolves.toBeNull();
    });
});
