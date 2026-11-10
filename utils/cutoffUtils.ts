import {
    CutoffCategory,
    CutoffRow,
    CutoffStatement,
    ExamCutoffs,
    LatestScore,
    Report,
} from '../app/types';

export const CUTOFF_CATEGORIES: CutoffCategory[] = [
    'Open', 'EWS', 'OBC-NCL', 'SC', 'ST', 'PWD',
];

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
    // PWD records carry the disability as a prefix on the base category. These
    // must never be folded into the base category: a PWD student's bar is 15
    // marks where Open's is 99, so reading them as Open would tell someone
    // they are 84 marks short of something they cleared long ago.
    //
    // All five PWD categories publish the same marks, so they share one row —
    // which is also why the row is labelled "PWD" and not "Gen-PWD": a PWD-SC
    // student has to be able to see that the row is theirs.
    'pwd': 'PWD',
    'pwd-gen': 'PWD',
    'pwd-general': 'PWD',
    'pwd gen': 'PWD',
    'pwd general': 'PWD',
    'pwd-ews': 'PWD',
    'pwd ews': 'PWD',
    'pwd-obc': 'PWD',
    'pwd obc': 'PWD',
    'pwd-obc-ncl': 'PWD',
    'pwd-sc': 'PWD',
    'pwd sc': 'PWD',
    'pwd-st': 'PWD',
    'pwd st': 'PWD',
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
 * An exam with no `studentStreams` applies to everyone. Otherwise it applies
 * only to the streams it names.
 *
 * A record with no stream at all is offered nothing. This used to fall back to
 * every exam so a missing field would not leave the screen empty, which had it
 * exactly backwards: a blank stream is the second most common value in the
 * student table, and the students inside it sit CLAT, CA, NDA and foundation
 * courses. Falling back handed all of them the JEE Mains ladder as if it were
 * theirs. An empty screen is the honest answer to "we do not know".
 */
export const examsForStudent = (
    exams: ExamCutoffs[],
    stream?: string | null
): ExamCutoffs[] => {
    const normalized = stream?.trim().toLowerCase();
    if (!normalized) return [];
    return exams.filter(
        (exam) => !exam.studentStreams || exam.studentStreams.includes(normalized)
    );
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
        .filter((rung) => typeof rung.mark === 'number' && Number.isFinite(rung.mark))
        // Ordered by mark, not by how the config happens to list them. Targets
        // are meant to ascend, but these are hand-maintained numbers: one row
        // out of order would otherwise both promote a student past a bar they
        // are under and point them at a "next" target below where they stand.
        .sort((a, b) => a.mark - b.mark);

    if (ladder.length === 0) return null;

    // Highest rung whose mark the student has met. Safe to read as the last
    // match now that the ladder is sorted by mark.
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
 * The student's most recent full-length attempt at this exam.
 *
 * A cutoff is a mark on one particular exam's paper, so three things have to
 * line up before an attempt can be held against it. All three gates are
 * deliberately strict: no score card is a far smaller problem than a confident
 * statement about the wrong paper.
 *
 * 1. The paper must belong to this exam. Real data is the argument here — a
 *    NEET student's nursing crash-course paper is out of 300, exactly like JEE
 *    Mains, so marks cannot stand in for exam identity. A report that does not
 *    say which exam it was is skipped rather than assumed to be this one.
 * 2. It must be out of the exam's own total, so a 40-mark chapter test is never
 *    read as a mark out of 300.
 * 3. When the report says what kind of paper it was, it must be one of the
 *    exam's full-length formats. Reports predating `test_format` carry an empty
 *    string and ride on the other two gates.
 *
 * The latest surviving attempt by date wins; an unparseable date sorts last.
 */
export const findLatestScore = (
    reports: Report[] | undefined | null,
    exam: ExamCutoffs
): LatestScore | null => {
    if (!Array.isArray(reports)) return null;

    const startedAt = (date: string): number => {
        const time = new Date(date).getTime();
        return Number.isNaN(time) ? -Infinity : time;
    };

    const scored = reports
        .map((report) => {
            const marks = toFiniteNumber(report.marks_scored);
            if (marks === null) return null;

            // Exams that name their report streams only accept papers from
            // them, and a paper that does not say which exam it was is skipped
            // rather than assumed to be this one.
            if (exam.reportStreams) {
                const stream = report.stream?.trim().toLowerCase();
                if (!stream || !exam.reportStreams.includes(stream)) return null;
            }

            // v2 documents exist where the stream and the course disagree —
            // the reports service's own NEET template checks either one — so a
            // paper naming another exam is rejected even when its stream looks
            // right. Only checked when the report states a course.
            if (exam.courses) {
                const course = report.course?.trim();
                if (course && !exam.courses.includes(course)) return null;
            }

            const totalMarks = toFiniteNumber(report.max_marks_possible);
            if (totalMarks !== exam.maxMarks) return null;

            const format = report.test_format?.trim();
            if (format && !exam.fullLengthFormats.includes(format)) return null;

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
        startedAt(score.startDate) > startedAt(latest.startDate) ? score : latest
    );
};
