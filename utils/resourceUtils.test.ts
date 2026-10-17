import { describe, expect, it } from 'vitest';
import { buildReportLink, normalizeChapterPriority, resolveChapterPriority } from './resourceUtils';

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

describe('normalizeChapterPriority', () => {
    it('accepts the values db-service records, regardless of casing or padding', () => {
        expect(normalizeChapterPriority('high')).toBe('high');
        expect(normalizeChapterPriority(' Medium ')).toBe('medium');
        expect(normalizeChapterPriority('LOW')).toBe('low');
    });

    it('treats anything else as untagged', () => {
        expect(normalizeChapterPriority(null)).toBeNull();
        expect(normalizeChapterPriority(undefined)).toBeNull();
        expect(normalizeChapterPriority('')).toBeNull();
        expect(normalizeChapterPriority('urgent')).toBeNull();
    });
});

describe('resolveChapterPriority', () => {
    // A chapter carries a mapping for every curriculum it belongs to, so the
    // requested curriculum has to be matched rather than assumed first.
    const curriculums = [
        { curriculum_id: 9, priority: 3, priority_text: 'low', weightage: null },
        { curriculum_id: 10, priority: null, priority_text: null, weightage: null },
        { curriculum_id: 1, priority: 1, priority_text: 'high', weightage: null },
    ];

    it('picks the priority belonging to the requested curriculum', () => {
        expect(resolveChapterPriority(curriculums, 1)).toBe('high');
        expect(resolveChapterPriority(curriculums, 9)).toBe('low');
    });

    it('returns null when that curriculum has no priority recorded', () => {
        expect(resolveChapterPriority(curriculums, 10)).toBeNull();
    });

    it('returns null when the chapter is not mapped to the curriculum at all', () => {
        expect(resolveChapterPriority(curriculums, 4)).toBeNull();
    });

    it('handles a missing mapping list or curriculum', () => {
        expect(resolveChapterPriority(undefined, 1)).toBeNull();
        expect(resolveChapterPriority(curriculums, undefined)).toBeNull();
        expect(resolveChapterPriority(curriculums, null)).toBeNull();
    });
});
