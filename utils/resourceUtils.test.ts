import { describe, expect, it } from 'vitest';
import { buildReportLink } from './resourceUtils';

describe('buildReportLink', () => {
    it('routes the report link through the report-launch API, encoded', () => {
        const original = 'https://reports.avantifellows.org/reports/student_quiz_report/S1/U1?a=1&b=2';
        const url = new URL(buildReportLink(original), 'https://gurukul.avantifellows.org');

        expect(url.pathname).toBe('/api/report-launch');
        expect(url.searchParams.get('url')).toBe(original);
    });

    it('passes an empty link through untouched', () => {
        expect(buildReportLink('')).toBe('');
    });
});
