import { describe, expect, it } from 'vitest';
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
