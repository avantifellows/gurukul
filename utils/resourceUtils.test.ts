import { describe, expect, it } from 'vitest';
import {
    buildReportLink,
    buildResourceLink,
    filterResourcesByPlayer,
    normalizeChapterPriority,
    resolveChapterPriority,
} from './resourceUtils';
import type { Resource } from '@/app/types';

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

describe('filterResourcesByPlayer', () => {
    const QUIZ = 'https://quiz.avantifellows.org/quiz/abc';
    const SASHAKT = 'https://assessment.sashakt.in/test/xyz';

    const quiz = (over: Partial<Resource>): Resource =>
        ({
            id: 1,
            name: [{ lang_code: 'en', resource: 'Motion in Two Dimension' }],
            chapter_id: 11,
            type: 'quiz',
            subtype: 'Assessment',
            link: QUIZ,
            ...over,
        }) as Resource;

    const links = (rows: Resource[]) => rows.map((row) => row.link);

    const bothFlavours = [
        quiz({ id: 1, link: QUIZ }),
        quiz({ id: 2, link: SASHAKT }),
    ];

    it('sends a Sashakt group to the Sashakt copy', () => {
        expect(links(filterResourcesByPlayer(bothFlavours, 'HimachalStudents'))).toEqual([SASHAKT]);
    });

    it('sends every listed group to Sashakt', () => {
        const groups = [
            'AllIndiaStudents', 'DelhiStudents', 'DishaStudents', 'GujaratStudents',
            'HaryanaStudents', 'HimachalStudents', 'MaharashtraStudents',
            'OLFStudents', 'PunjabStudents', 'UttarakhandStudents',
        ];
        groups.forEach((group) => {
            expect(links(filterResourcesByPlayer(bothFlavours, group))).toEqual([SASHAKT]);
        });
    });

    it('leaves every other group on the quiz engine', () => {
        ['EnableStudents', 'ChhattisgarhStudents', 'EMRSStudents'].forEach((group) => {
            expect(links(filterResourcesByPlayer(bothFlavours, group))).toEqual([QUIZ]);
        });
    });

    it('falls back to the quiz engine with no group', () => {
        expect(links(filterResourcesByPlayer(bothFlavours, undefined))).toEqual([QUIZ]);
        expect(links(filterResourcesByPlayer(bothFlavours, null))).toEqual([QUIZ]);
    });

    // The whole point of the counterpart check: a chapter that exists in only
    // one player must stay visible, or a Sashakt group loses every test that
    // was never twinned.
    it('keeps a lone copy whichever flavour it is', () => {
        const onlyQuiz = [quiz({ id: 1, link: QUIZ })];
        expect(links(filterResourcesByPlayer(onlyQuiz, 'HimachalStudents'))).toEqual([QUIZ]);

        const onlySashakt = [quiz({ id: 2, link: SASHAKT })];
        expect(links(filterResourcesByPlayer(onlySashakt, 'EnableStudents'))).toEqual([SASHAKT]);
    });

    it('pairs on chapter and name, so a different chapter is not a counterpart', () => {
        const rows = [
            quiz({ id: 1, chapter_id: 11, link: QUIZ }),
            quiz({ id: 2, chapter_id: 12, link: SASHAKT }),
        ];
        expect(filterResourcesByPlayer(rows, 'HimachalStudents')).toHaveLength(2);
    });

    // The row states its player, so the filter keeps working if Sashakt ever
    // moves domain, or a second Avanti-hosted player appears.
    it('trusts type_params.player over the link host', () => {
        const rows = [
            quiz({ id: 1, link: 'https://elsewhere.example/a', type_params: { player: 'quiz' } }),
            quiz({ id: 2, link: 'https://elsewhere.example/b', type_params: { player: 'sashakt' } }),
        ];
        expect(links(filterResourcesByPlayer(rows, 'HimachalStudents')))
            .toEqual(['https://elsewhere.example/b']);
        expect(links(filterResourcesByPlayer(rows, 'EnableStudents')))
            .toEqual(['https://elsewhere.example/a']);
    });

    it('falls back to the link host when the row has no player', () => {
        expect(links(filterResourcesByPlayer(bothFlavours, 'HimachalStudents'))).toEqual([SASHAKT]);
    });

    // A row kept as the Sashakt copy must also launch through the Sashakt
    // route. These two decisions used to be made from different inputs -- the
    // filter from type_params.player, the link from the URL host -- so a
    // stamped row on another host was kept and then launched as a quiz.
    it('routes a kept row through its own player\'s launch route', () => {
        const row = quiz({
            id: 2,
            link: 'https://elsewhere.example/b',
            type_params: { player: 'sashakt' },
        });
        expect(filterResourcesByPlayer([row], 'HimachalStudents')).toHaveLength(1);
        expect(buildResourceLink(row)).toContain('/api/sashakt-launch');

        const quizRow = quiz({
            id: 3,
            link: SASHAKT,
            type_params: { player: 'quiz' },
        });
        expect(buildResourceLink(quizRow)).toContain('/api/quiz-launch');
    });

    it('pairs twins whose names differ only in case or spacing', () => {
        const rows = [
            quiz({ id: 1, link: QUIZ, name: [{ lang_code: 'en', resource: 'Motion in Two Dimension' }] }),
            quiz({ id: 2, link: SASHAKT, name: [{ lang_code: 'en', resource: ' Motion In Two Dimension ' }] }),
        ];
        expect(links(filterResourcesByPlayer(rows, 'HimachalStudents'))).toEqual([SASHAKT]);
        expect(links(filterResourcesByPlayer(rows, 'EnableStudents'))).toEqual([QUIZ]);
    });

    it('leaves non-quiz resources untouched', () => {
        const rows = [
            quiz({ id: 1, link: QUIZ }),
            quiz({ id: 2, link: SASHAKT }),
            quiz({ id: 3, type: 'document', link: 'https://drive.example/notes' }),
        ];
        const kept = filterResourcesByPlayer(rows, 'HimachalStudents');
        expect(links(kept)).toEqual([SASHAKT, 'https://drive.example/notes']);
    });
});
