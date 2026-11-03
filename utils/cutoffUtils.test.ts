import { describe, expect, it } from 'vitest';
import {
    buildCutoffStatement,
    examsForStudent,
    findCutoffRow,
    findLatestScore,
    normalizeCutoffCategory,
} from './cutoffUtils';
import cutoffConfig from '../config/cutoffConfig';
import { ExamCutoffs, Report } from '../app/types';

const jeeMains = cutoffConfig[0];
const openRow = findCutoffRow(jeeMains, 'Open')!;

describe('normalizeCutoffCategory', () => {
    it('accepts the spellings student records actually carry', () => {
        expect(normalizeCutoffCategory('General')).toBe('Open');
        expect(normalizeCutoffCategory(' gen ')).toBe('Open');
        expect(normalizeCutoffCategory('UR')).toBe('Open');
        expect(normalizeCutoffCategory('EWS')).toBe('EWS');
        expect(normalizeCutoffCategory('obc')).toBe('OBC-NCL');
        expect(normalizeCutoffCategory('OBC_NCL')).toBe('OBC-NCL');
        expect(normalizeCutoffCategory('obc ncl')).toBe('OBC-NCL');
        expect(normalizeCutoffCategory('sc')).toBe('SC');
        expect(normalizeCutoffCategory('St')).toBe('ST');
    });

    it('treats an unknown or missing category as nothing to personalise with', () => {
        expect(normalizeCutoffCategory(null)).toBeNull();
        expect(normalizeCutoffCategory(undefined)).toBeNull();
        expect(normalizeCutoffCategory('')).toBeNull();
        expect(normalizeCutoffCategory('PwD')).toBeNull();
    });
});

describe('findCutoffRow', () => {
    it('returns the row for the student’s own category', () => {
        expect(findCutoffRow(jeeMains, 'SC')?.marks.tier1).toBe(138);
    });

    it('returns nothing when the category is unknown', () => {
        expect(findCutoffRow(jeeMains, null)).toBeNull();
    });
});

describe('buildCutoffStatement', () => {
    it('counts the marks to the first target when the student is below it', () => {
        const statement = buildCutoffStatement(jeeMains, openRow, 64)!;

        expect(statement.reachedIndex).toBe(-1);
        expect(statement.headline).toBe('You are just 16 marks away from qualifying JEE Mains!');
        expect(statement.nextTarget).toBeNull();
    });

    it('points a qualified student at NIT admission', () => {
        const statement = buildCutoffStatement(jeeMains, openRow, 118)!;

        expect(statement.reachedIndex).toBe(0);
        expect(statement.headline).toBe('Good job! You are on track to qualifying JEE Mains!');
        expect(statement.nextTarget).toBe('Your next target: 11 more marks for NIT Admission.');
    });

    it('points a Tier 2 student at a Tier 1 NIT', () => {
        const statement = buildCutoffStatement(jeeMains, openRow, 171)!;

        expect(statement.reachedIndex).toBe(1);
        expect(statement.headline).toBe(
            'Good job! You are on track to qualifying JEE Mains and getting into an NIT!'
        );
        expect(statement.nextTarget).toBe('Your next target: 30 more marks for a Tier 1 NIT.');
    });

    it('stops asking for more once the top target is reached', () => {
        const statement = buildCutoffStatement(jeeMains, openRow, 214)!;

        expect(statement.reachedIndex).toBe(2);
        expect(statement.nextTarget).toBeNull();
    });

    it('treats a mark exactly on a target as reached', () => {
        expect(buildCutoffStatement(jeeMains, openRow, 80)!.reachedIndex).toBe(0);
        expect(buildCutoffStatement(jeeMains, openRow, 201)!.reachedIndex).toBe(2);
    });

    it('reads each category against its own marks', () => {
        const stRow = findCutoffRow(jeeMains, 'ST')!;
        const statement = buildCutoffStatement(jeeMains, stRow, 64)!;

        // 64 is below Open's qualifying mark but past ST's, so the two
        // categories must not read the same at the same score.
        expect(statement.reachedIndex).toBe(0);
        expect(statement.nextTarget).toBe('Your next target: 13 more marks for NIT Admission.');
    });

    it('says nothing rather than borrow another target’s wording', () => {
        // Only "qualify" carries below-target copy. With no qualifying mark on
        // the row, a student under every mark present gets no statement at all
        // — better than being told they are N marks from the wrong thing.
        const row = { category: 'Open' as const, marks: { tier1: 201 } };
        expect(buildCutoffStatement(jeeMains, row, 150)).toBeNull();
    });

    it('says nothing when the row has no marks at all', () => {
        expect(buildCutoffStatement(jeeMains, { category: 'Open', marks: {} }, 150)).toBeNull();
    });

    it('skips a target the sheet has no mark for', () => {
        const row = { category: 'Open' as const, marks: { qualify: 80, tier1: 201 } };
        const statement = buildCutoffStatement(jeeMains, row, 150)!;

        expect(statement.reachedIndex).toBe(0);
        expect(statement.nextTarget).toBe('Your next target: 51 more marks for a Tier 1 NIT.');
    });
});

describe('examsForStudent', () => {
    const neet: ExamCutoffs = { ...jeeMains, id: 'neet', name: 'NEET', shortName: 'NEET', streams: ['pcb'] };
    const common: ExamCutoffs = { ...jeeMains, id: 'cuet', name: 'CUET', shortName: 'CUET', streams: undefined };

    it('offers a stream its own exams, plus the ones open to everyone', () => {
        expect(examsForStudent([jeeMains, neet, common], 'PCM').map((exam) => exam.id))
            .toEqual(['jee-main', 'cuet']);
        expect(examsForStudent([jeeMains, neet, common], 'pcb').map((exam) => exam.id))
            .toEqual(['neet', 'cuet']);
    });

    it('offers everything when the record has no stream', () => {
        expect(examsForStudent([jeeMains, neet], null)).toHaveLength(2);
        expect(examsForStudent([jeeMains, neet], '  ')).toHaveLength(2);
    });

    it('offers everything rather than nothing when the stream matches no exam', () => {
        expect(examsForStudent([jeeMains, neet], 'commerce')).toHaveLength(2);
    });
});

describe('findLatestScore', () => {
    const report = (overrides: Partial<Report>): Report => ({
        test_name: 'JEE Main Mock',
        rank: '1',
        report_link: 'https://reports.avantifellows.org/r/1',
        start_date: '2026-10-01',
        ...overrides,
    });

    it('returns nothing while the reports API sends no marks', () => {
        expect(findLatestScore([report({}), report({ start_date: '2026-10-18' })], 300)).toBeNull();
        expect(findLatestScore(undefined, 300)).toBeNull();
    });

    it('picks the most recent scored attempt, whatever order they arrive in', () => {
        const score = findLatestScore(
            [
                report({ start_date: '2026-09-02', marks: 140 }),
                report({ start_date: '2026-10-18', marks: 171, test_name: 'JEE Main Mock 4' }),
                report({ start_date: '2026-10-04', marks: 155 }),
            ],
            300
        )!;

        expect(score.marks).toBe(171);
        expect(score.testName).toBe('JEE Main Mock 4');
        expect(score.totalMarks).toBe(300);
    });

    it('ignores attempts with no marks and reads numeric strings', () => {
        const score = findLatestScore(
            [
                report({ start_date: '2026-10-20' }),
                report({ start_date: '2026-10-18', marks: '171', total_marks: '300' }),
            ],
            300
        )!;

        expect(score.marks).toBe(171);
        expect(score.totalMarks).toBe(300);
    });

    it('prefers the total the report states over the exam default', () => {
        const score = findLatestScore([report({ marks: 60, total_marks: 100 })], 300)!;
        expect(score.totalMarks).toBe(100);
    });
});
