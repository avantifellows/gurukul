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

    it('keeps PWD categories distinct from their base category', () => {
        // ~23k enrolled students carry PWD as a prefix. Folding PWD-Gen into
        // Open would show a bar of 99 where theirs is 15.
        expect(normalizeCutoffCategory('PWD-Gen')).toBe('PWD-Gen');
        expect(normalizeCutoffCategory('PWD-General')).toBe('PWD-Gen');
        expect(normalizeCutoffCategory('pwd-obc')).toBe('PWD-OBC');
        expect(normalizeCutoffCategory('PWD_SC')).toBe('PWD-SC');
        expect(normalizeCutoffCategory('PWD-ST')).toBe('PWD-ST');
        expect(normalizeCutoffCategory('PWD-EWS')).toBe('PWD-EWS');
    });

    it('gives a PWD student their own bar, not the base category\u2019s', () => {
        const pwd = findCutoffRow(jeeMains, 'PWD-Gen')!;
        const open = findCutoffRow(jeeMains, 'Open')!;

        expect(pwd.marks.qualify).toBe(15);
        expect(open.marks.qualify).toBe(99);

        // A PWD-Gen student on 40 has cleared both their bars; read as Open
        // they would be told they are 59 marks short of qualifying.
        const statement = buildCutoffStatement(jeeMains, pwd, 40)!;
        expect(statement.reachedIndex).toBe(1);
        expect(statement.headline).toContain('getting into an NIT');
        // No Tier 1 figure exists for PWD, so nothing is invented to aim at.
        expect(statement.nextTarget).toBeNull();
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
        expect(statement.headline).toBe('You are just 35 marks away from qualifying JEE Mains!');
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
        expect(buildCutoffStatement(jeeMains, openRow, 99)!.reachedIndex).toBe(0);
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
    const neet: ExamCutoffs = { ...jeeMains, id: 'neet', name: 'NEET', shortName: 'NEET', studentStreams: ['pcb'] };
    const common: ExamCutoffs = { ...jeeMains, id: 'cuet', name: 'CUET', shortName: 'CUET', studentStreams: undefined };

    it('offers a stream its own exams, plus the ones open to everyone', () => {
        expect(examsForStudent([jeeMains, neet, common], 'pcm').map((exam) => exam.id))
            .toEqual(['jee-main', 'cuet']);
        expect(examsForStudent([jeeMains, neet, common], 'pcb').map((exam) => exam.id))
            .toEqual(['neet', 'cuet']);
    });

    it('offers nothing when the record has no stream', () => {
        // A blank stream is the second most common value in the student table,
        // and CLAT / CA / NDA / foundation students sit inside it. Falling back
        // to every exam handed all of them the JEE Mains ladder.
        expect(examsForStudent([jeeMains, neet], null)).toEqual([]);
        expect(examsForStudent([jeeMains, neet], '  ')).toEqual([]);
        expect(examsForStudent([jeeMains, neet], undefined)).toEqual([]);
    });

    it('offers the engineering bar to the stream spellings records actually use', () => {
        for (const stream of ['engineering', 'Engg', 'PCM', 'pcmb']) {
            expect(examsForStudent([jeeMains], stream).map((e) => e.id)).toEqual(['jee-main']);
        }
    });

    it('offers nothing when the stream matches no exam', () => {
        // A medical student must not be handed JEE Mains cutoffs just because
        // JEE Mains is the only exam configured.
        expect(examsForStudent([jeeMains], 'medical')).toEqual([]);
        expect(examsForStudent([jeeMains, neet], 'commerce')).toEqual([]);
    });
});

describe('findLatestScore', () => {
    const report = (overrides: Partial<Report>): Report => ({
        test_name: 'JEE Main Mock',
        rank: '1',
        report_link: 'https://reports.avantifellows.org/r/1',
        start_date: '2026-10-01',
        marks_scored: 150,
        max_marks_possible: 300,
        test_format: 'mock_test',
        stream: 'engineering',
        ...overrides,
    });

    it('returns nothing when no attempt carries marks', () => {
        expect(findLatestScore([report({ marks_scored: undefined })], jeeMains)).toBeNull();
        expect(findLatestScore(undefined, jeeMains)).toBeNull();
        expect(findLatestScore([], jeeMains)).toBeNull();
    });

    it('picks the most recent qualifying attempt, whatever order they arrive in', () => {
        const score = findLatestScore(
            [
                report({ start_date: '2026-09-02', marks_scored: 140 }),
                report({ start_date: '2026-10-18', marks_scored: 171, test_name: 'JEE Main Mock 4' }),
                report({ start_date: '2026-10-04', marks_scored: 155 }),
            ],
            jeeMains
        )!;

        expect(score.marks).toBe(171);
        expect(score.testName).toBe('JEE Main Mock 4');
        expect(score.totalMarks).toBe(300);
    });

    it('ignores a part test, however recent', () => {
        // The case Surya caught: 36/300 on a part test is not a JEE Mains score,
        // and taking the latest entry would have compared it to the cutoff.
        const score = findLatestScore(
            [
                report({ start_date: '2026-10-18', marks_scored: 171 }),
                report({ start_date: '2026-10-25', marks_scored: 36, test_format: 'part_test' }),
            ],
            jeeMains
        )!;

        expect(score.marks).toBe(171);
    });

    it('ignores another exam\u2019s paper, even at the same total and format', () => {
        // Taken from a real student: nine attempts, all NEET, and the one paper
        // out of 300 is a nursing crash-course full syllabus test. Marks and
        // format both pass; only the stream tells the two exams apart.
        expect(
            findLatestScore(
                [
                    report({
                        test_name: 'DL_12_CrashCourse_FST5_Nursing',
                        start_date: '2023-06-08',
                        marks_scored: 0,
                        max_marks_possible: 300,
                        test_format: 'full_syllabus_test',
                        stream: 'medical',
                    }),
                ],
                jeeMains
            )
        ).toBeNull();
    });

    it('rejects a paper whose course names another exam', () => {
        // v2 docs exist where stream and course disagree; the reports service's
        // own NEET template checks either one.
        expect(
            findLatestScore([report({ course: 'NEET' })], jeeMains)
        ).toBeNull();
        expect(findLatestScore([report({ course: 'JEE Mains' })], jeeMains)).not.toBeNull();
        // No course stated: the stream gate still carries it.
        expect(findLatestScore([report({ course: '' })], jeeMains)).not.toBeNull();
    });

    it('reads the ladder by marks, not by the order the config lists them', () => {
        // Tier 1 sits below Tier 2 here — the kind of slip a hand-maintained
        // table invites, and the Tier 1 figures are still unconfirmed.
        const scrambled = { category: 'Open' as const, marks: { qualify: 99, tier2: 129, tier1: 120 } };

        // At 125 the student has cleared 99 and 120 but not 129, and is aimed
        // at the 129 bar — not told they have passed it.
        const below = buildCutoffStatement(jeeMains, scrambled, 125)!;
        expect(jeeMains.targets[below.reachedIndex].key).toBe('tier1');
        expect(below.nextTarget).toBe('Your next target: 4 more marks for NIT Admission.');

        // At 130 every bar is cleared, and the highest one is the 129.
        const above = buildCutoffStatement(jeeMains, scrambled, 130)!;
        expect(jeeMains.targets[above.reachedIndex].key).toBe('tier2');
        expect(above.nextTarget).toBeNull();
    });

    it('skips a report that does not say which exam it was', () => {
        expect(findLatestScore([report({ stream: '' })], jeeMains)).toBeNull();
        expect(findLatestScore([report({ stream: undefined })], jeeMains)).toBeNull();
    });

    it('ignores a paper marked out of anything else', () => {
        // A 40-mark chapter test: right shape, wrong scale.
        expect(
            findLatestScore(
                [report({ marks_scored: 31, max_marks_possible: 40, test_format: 'major_test' })],
                jeeMains
            )
        ).toBeNull();
    });

    it('skips an attempt whose scale is unknown rather than assuming the exam total', () => {
        expect(
            findLatestScore([report({ marks_scored: 31, max_marks_possible: undefined })], jeeMains)
        ).toBeNull();
    });

    it('accepts a report predating test_format on the strength of its scale', () => {
        const score = findLatestScore(
            [report({ marks_scored: 171, test_format: '' })],
            jeeMains
        )!;

        expect(score.marks).toBe(171);
    });

    it('reads numeric strings, as DynamoDB decimals arrive', () => {
        const score = findLatestScore(
            [report({ marks_scored: '171', max_marks_possible: '300' })],
            jeeMains
        )!;

        expect(score.marks).toBe(171);
        expect(score.totalMarks).toBe(300);
    });

    it('sorts an undated attempt last rather than letting it win', () => {
        const score = findLatestScore(
            [
                report({ start_date: '', marks_scored: 90 }),
                report({ start_date: '2026-10-18', marks_scored: 171 }),
            ],
            jeeMains
        )!;

        expect(score.marks).toBe(171);
    });
});
