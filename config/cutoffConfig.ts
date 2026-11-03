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
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ PENDING: every mark in the `qualify` column below is a placeholder. The  │
 * │ tier marks are Amogh's M1a / M1b figures; the qualifying marks were put  │
 * │ in only so the statement had something to count against. Replace them    │
 * │ with the real JEE Mains qualifying cutoffs before this is switched on    │
 * │ for a group.                                                             │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
const cutoffConfig: ExamCutoffs[] = [
    {
        id: 'jee-main',
        name: 'JEE Mains',
        shortName: 'JEE Mains',
        maxMarks: 300,
        cycleLabel: '2026 cycle',
        sourceNote: "Based on last year's JoSAA cutoffs.",
        tableNote: "Marks out of 300, from last year's JoSAA cutoffs.",
        streams: ['pcm', 'engineering', 'jee'],
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
                description: 'A top-3 branch at one of the five lowest NIRF-ranked NITs — Raipur, Hamirpur, Puducherry, Meghalaya, Kurukshetra.',
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
            { category: 'Open', marks: { qualify: 80, tier2: 129, tier1: 201 } },
            { category: 'EWS', marks: { qualify: 68, tier2: 129, tier1: 194 } },
            { category: 'OBC-NCL', marks: { qualify: 68, tier2: 125, tier1: 184 } },
            { category: 'SC', marks: { qualify: 52, tier2: 88, tier1: 138 } },
            { category: 'ST', marks: { qualify: 42, tier2: 77, tier1: 122 } },
        ],
    },
];

export default cutoffConfig;
