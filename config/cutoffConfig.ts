import { ExamCutoffs } from "@/app/types";

/**
 * Student-facing exam cutoffs.
 *
 * One entry per exam. The marks hold for an admission cycle, so they live here
 * rather than in db-service: changing them is a config edit and a deploy, not a
 * migration. NEET, JEE Advanced and the state CETs each become a new entry; the
 * screen grows an exam switcher on its own as soon as a student has two.
 *
 * Wording note: the internal M1a / M1b / M2 labels never appear here. Students
 * read three named targets instead, in the order they would reach them.
 *
 * Where the marks come from, column by column:
 *
 * - `qualify` and `tier2` are Avanti's own internal test cutoffs, read from
 *   BigQuery `production_dbt_final.dim_test_cutoffs` for academic year
 *   2026-2027, exam JEE Mains, stream engineering. `qualify` is the M2 bar and
 *   `tier2` is the M1 bar — the same table `fact_student_test_results_overall`
 *   uses to assign a student their academic level, so the screen and the
 *   reports measure against the same marks. That table is hand-maintained and
 *   re-set each academic year: when 2027-2028 lands, these need re-reading.
 *
 * - `tier1` is Amogh's M1a figure and has no source in the warehouse. The NTA
 *   bands in `dim_nta_cutoffs` do carry M1a, but for JEE Mains they are
 *   percentiles from 2019 onwards (Gen M1a is the 98.89th percentile), not
 *   marks out of 300. These five numbers are a marks conversion of that band
 *   that only Amogh has. Confirm them with him before this ships.
 */
const cutoffConfig: ExamCutoffs[] = [
    {
        id: 'jee-main',
        name: 'JEE Mains',
        shortName: 'JEE Mains',
        maxMarks: 300,
        cycleLabel: '2026-27',
        sourceNote: "Based on last year's JoSAA cutoffs.",
        tableNote: 'Marks out of 300, from this year’s cutoffs.',
        // The formats Gurukul already groups practice tests by, minus
        // part_test: a part test covers part of the syllabus, so 171 on one is
        // not 171 on a JEE Mains paper.
        fullLengthFormats: ['major_test', 'full_syllabus_test', 'mock_test', 'previous_year_test'],
        // Record values, checked against dim_student.student_stream. 'pcmb'
        // students sit the engineering bar (dim_student's own academic-level
        // rule says so) and there are ~17k of them, so they belong here.
        // 'jee' was in this list and matches no student record at all.
        studentStreams: ['engineering', 'engg', 'pcm', 'pcmb'],
        // Report values, checked against the paper a score came from.
        reportStreams: ['engineering'],
        courses: ['JEE Mains'],
        targets: [
            {
                key: 'qualify',
                columnLabel: 'Qualify',
                name: 'Qualify in JEE Mains',
                description: 'The mark that clears the JEE Mains qualifying cutoff and lets you sit for JEE Advanced.',
                belowHeadline: 'You are just {marks} marks away from qualifying JEE Mains!',
                reachedHeadline: 'Good job! You are on track to qualifying JEE Mains!',
            },
            {
                key: 'tier2',
                columnLabel: 'Tier 2',
                name: 'NIT Tier 2 colleges',
                // Per Vishal (10 Nov): the Tier 2 mark is the average of the
                // Civil and Mechanical Engineering cutoffs — two branches every
                // NIT offers, picked precisely because they are not the
                // competitive ones — at a bottom-5 NIRF ranked NIT. Note this
                // is deliberately not parallel to Tier 1, which is a top-3
                // branch: the two tiers differ by branch as well as by college.
                description: 'Civil or Mechanical Engineering — branches every NIT offers — at one of the five lowest NIRF-ranked NITs: Raipur, Hamirpur, Puducherry, Meghalaya, Kurukshetra.',
                reachedHeadline: 'Good job! You are on track to qualifying JEE Mains and getting into an NIT!',
                nextTargetLabel: 'NIT Admission',
            },
            {
                key: 'tier1',
                columnLabel: 'Tier 1',
                name: 'NIT Tier 1 colleges',
                description: 'A top-3 branch at one of the five highest NIRF-ranked NITs — Trichy, Rourkela, Surathkal, Calicut, Warangal.',
                reachedHeadline: 'Good job! You are on track to qualifying JEE Mains and getting into an NIT!',
                // Named while the student is between Tier 2 and Tier 1. This is
                // the one line the test reports have no equivalent for yet —
                // they stop at NIT admission — so it should be added at the
                // source and read from there once it exists.
                nextTargetLabel: 'a Tier 1 NIT',
            },
        ],
        cutoffs: [
            // qualify = M2, tier2 = M1, both for 2026-2027 (warehouse categories
            // Gen / Gen-EWS / OBC map onto Open / EWS / OBC-NCL here).
            { category: 'Open', marks: { qualify: 99, tier2: 129, tier1: 201 } },
            { category: 'EWS', marks: { qualify: 66, tier2: 129, tier1: 194 } },
            { category: 'OBC-NCL', marks: { qualify: 63, tier2: 125, tier1: 184 } },
            { category: 'SC', marks: { qualify: 40, tier2: 88, tier1: 138 } },
            { category: 'ST', marks: { qualify: 30, tier2: 77, tier1: 122 } },
            // PWD students have their own, far lower bars — 15 and 30 against
            // Open's 99 and 129 — so they are never read as their base
            // category. All five PWD categories publish identical marks, so
            // ~23k enrolled students share this one row instead of five
            // repeating rows on a phone. No Tier 1 figure exists for them, so
            // that cell stays empty rather than borrowing another row's.
            { category: 'PWD', marks: { qualify: 15, tier2: 30 } },
        ],
    },
];

export default cutoffConfig;
