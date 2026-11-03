import {
    CutoffCategory,
    CutoffRow,
    CutoffStatement,
    ExamCutoffs,
    LatestScore,
    Report,
} from '../app/types';

export const CUTOFF_CATEGORIES: CutoffCategory[] = ['Open', 'EWS', 'OBC-NCL', 'SC', 'ST'];

// Student records carry free text typed by whoever onboarded the batch, so the
// same category arrives spelled several ways. Anything not listed here is read
// as "no category on file" and the screen stays impersonal rather than guessing.
const CATEGORY_ALIASES: Record<string, CutoffCategory> = {
    'open': 'Open',
    'general': 'Open',
    'gen': 'Open',
    'ur': 'Open',
    'unreserved': 'Open',
    'ews': 'EWS',
    'gen-ews': 'EWS',
    'general-ews': 'EWS',
    'obc': 'OBC-NCL',
    'obc-ncl': 'OBC-NCL',
    'obcncl': 'OBC-NCL',
    'obc ncl': 'OBC-NCL',
    'obc(ncl)': 'OBC-NCL',
    'sc': 'SC',
    'st': 'ST',
};

/**
 * Map the free-text category on a student record onto one of the five the
 * cutoff sheets are published against. Returns null when the record has no
 * category, or one nobody has taught this screen about.
 */
export const normalizeCutoffCategory = (value?: string | null): CutoffCategory | null => {
    if (!value) return null;
    const normalized = value.trim().toLowerCase().replace(/[_\s]+/g, ' ');
    return CATEGORY_ALIASES[normalized] ?? CATEGORY_ALIASES[normalized.replace(/\s/g, '')] ?? null;
};

/** The student's own row of an exam's table, or null when their category is unknown. */
export const findCutoffRow = (
    exam: ExamCutoffs,
    category: CutoffCategory | null
): CutoffRow | null => {
    if (!category) return null;
    return exam.cutoffs.find((row) => row.category === category) ?? null;
};

/**
 * The exams a student should be offered, in config order.
 *
 * An exam with no `streams` applies to everyone. Otherwise it applies when the
 * student's stream is one of them — and, when the record has no stream at all,
 * every configured exam is offered rather than none, so a missing field never
 * leaves the screen empty.
 */
export const examsForStudent = (
    exams: ExamCutoffs[],
    stream?: string | null
): ExamCutoffs[] => {
    const normalized = stream?.trim().toLowerCase();
    if (!normalized) return exams;
    const matching = exams.filter(
        (exam) => !exam.streams || exam.streams.includes(normalized)
    );
    return matching.length > 0 ? matching : exams;
};

/**
 * What the score card says to a student who scored `marks` in `exam`.
 *
 * Targets are read in ascending order: the highest one the student has reached
 * supplies the headline, and the one above it — if there is one — supplies the
 * "how much further" line. Below the first target they are told how far they
 * are from it and nothing else, which is the test reports' own behaviour.
 *
 * Returns null when the row carries no mark for the first target, since there
 * is then nothing to measure the score against.
 */
export const buildCutoffStatement = (
    exam: ExamCutoffs,
    row: CutoffRow,
    marks: number
): CutoffStatement | null => {
    // Only the targets this category actually has a mark for. A sheet that is
    // missing a rung should still aim the student at the next one above it,
    // rather than go quiet.
    const ladder = exam.targets
        .map((target, index) => ({ target, index, mark: row.marks[target.key] }))
        .filter((rung) => typeof rung.mark === 'number' && Number.isFinite(rung.mark));

    if (ladder.length === 0) return null;

    // Highest rung whose mark the student has met.
    let reachedRung = -1;
    for (let position = 0; position < ladder.length; position += 1) {
        if (marks >= ladder[position].mark) reachedRung = position;
    }

    if (reachedRung === -1) {
        // Only the lowest rung carries "you are N marks away" copy, and it is
        // written about that rung by name. If the row has no mark for it there
        // is nothing truthful to say, so the card stays off.
        const lowest = ladder[0];
        const template = lowest.target.belowHeadline;
        if (!template) return null;
        return {
            headline: template.replace('{marks}', String(lowest.mark - marks)),
            nextTarget: null,
            reachedIndex: -1,
        };
    }

    const reached = ladder[reachedRung];
    const next = ladder[reachedRung + 1];
    const nextTarget = next?.target.nextTargetLabel
        ? `Your next target: ${next.mark - marks} more marks for ${next.target.nextTargetLabel}.`
        : null;

    return {
        headline: reached.target.reachedHeadline,
        nextTarget,
        reachedIndex: reached.index,
    };
};

const toFiniteNumber = (value: unknown): number | null => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};

/**
 * The most recent report that carries a usable score.
 *
 * The reports API does not send marks yet — the data sits in DDB behind the
 * student reports v2 flow — so this returns null today and the screen hides its
 * score card. It starts working the moment the endpoint adds the fields; the
 * fallback total keeps a report that sends marks without a denominator usable.
 */
export const findLatestScore = (
    reports: Report[] | undefined | null,
    fallbackTotal: number
): LatestScore | null => {
    if (!Array.isArray(reports)) return null;

    const scored = reports
        .map((report) => {
            const marks = toFiniteNumber(report.marks);
            if (marks === null) return null;
            const totalMarks = toFiniteNumber(report.total_marks) ?? fallbackTotal;
            if (totalMarks <= 0) return null;
            return {
                marks,
                totalMarks,
                testName: report.test_name,
                startDate: report.start_date,
            };
        })
        .filter((score): score is LatestScore => score !== null);

    if (scored.length === 0) return null;

    return scored.reduce((latest, score) =>
        new Date(score.startDate).getTime() > new Date(latest.startDate).getTime()
            ? score
            : latest
    );
};
