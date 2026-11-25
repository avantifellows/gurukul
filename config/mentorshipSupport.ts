import type { GroupConfig, ResourceTile } from "@/app/types";

/**
 * Mentorship Support: what a student's mentor can do for them, by grade.
 *
 * Shown only to programs whose Gurukul config sets `showMentorshipSupport`
 * (the Voucher / Blended program). The copy is the program team's approved
 * mockup, word for word; edit it here, not in the page.
 */

export const MENTORSHIP_PATH = "/mentorship";

export const MENTORSHIP_TILE: ResourceTile = {
    title: "Mentorship Support",
    subtitle: "Know how your mentor can support you",
    href: MENTORSHIP_PATH,
    icon: "mentor",
    badge: "For your program",
};

export type MentorshipGrade = 12 | 13;

export interface MentorshipItem {
    title: string;
    body: string;
}

export interface MentorshipGradeContent {
    grade: MentorshipGrade;
    label: string;
    caption: string;
    help: MentorshipItem[];
    expect: MentorshipItem[];
}

export const MENTORSHIP_INTRO =
    "Your mentor is someone you can come to about your preparation, big or small. You don’t have to wait for your next check-in—reach out whenever a question or concern comes up.";

export const MENTORSHIP_EYEBROW = "Resources · Voucher / Blended Program";

const sharedHelp: MentorshipItem[] = [
    { title: "Stress or things at home", body: "Share what is weighing on you. A therapist can be brought in if needed." },
    { title: "Phone, tablet or internet problems", body: "If technology gets in the way of classes or tests, tell your mentor so they can help find a fix." },
    { title: "Doubts", body: "Your mentor can connect you with subject teachers and doubt-solving WhatsApp groups." },
    { title: "Before the exam", body: "Career and JEE counselling, application forms, category certificate guidance where needed, and reminders for exam dates and registration deadlines." },
    { title: "After the exam", body: "Guidance on JoSAA, JAC and other counselling and choice filling; seat selection; state engineering exams and colleges beyond IITs and NITs; support until your seat is confirmed." },
    { title: "A concrete Plan B", body: "If JEE does not go as hoped, explore Sitare University, Plaksha University and Azim Premji University, including admission support." },
    { title: "Upgrading your batch", body: "If you bought a PW batch, you may be eligible for a performance-based upgrade; Avanti covers the cost." },
    { title: "Family support", body: "Your mentor can visit your home when needed and help parents or guardians understand the JEE process, options and realistic outcomes." },
    { title: "Learn from alumni", body: "Your mentor can connect you with alumni who have been through the same journey." },
    { title: "After you join college", body: "Scholarship support and guidance from your mentor and alumni network continue." },
];

const sharedExpect: MentorshipItem[] = [
    { title: "Prompt follow-through", body: "When you raise a problem, your mentor acts quickly and keeps you updated until it is fixed." },
    { title: "Updates for your parents", body: "Your parents or guardians get regular updates on your attendance, scores and progress." },
    { title: "No question is too small", body: "If you are unsure whether your mentor can help, ask anyway!" },
];

export const MENTORSHIP_GRADES: MentorshipGradeContent[] = [
    {
        grade: 12,
        label: "Grade 12 Mentorship",
        caption: "Board exams + JEE guidance",
        help: [
            { title: "A study plan", body: "A weekly timetable, a revision plan and priority chapters to help balance board exams with JEE." },
            { title: "Your marks", body: "Review test performance together, understand what went well or badly, and plan how to catch up on backlog chapters." },
            { title: "Exam strategy", body: "Discuss paper approach, question selection, time management, reservation categories and cutoffs." },
            ...sharedHelp,
        ],
        expect: [
            { title: "Regular check-ins", body: "Your mentor will talk to you every 2 weeks." },
            ...sharedExpect,
        ],
    },
    {
        grade: 13,
        label: "Grade 13 Mentorship",
        caption: "JEE preparation and next steps",
        help: [
            { title: "A study plan", body: "A weekly timetable, revision plan and list of priority chapters." },
            { title: "Setting your goal", body: "Pick a target rank or college range and regularly check together how close you are." },
            { title: "Your marks", body: "Review test scores together, understand why a test went well or badly, and plan how to catch up on backlog chapters." },
            { title: "Exam strategy", body: "Discuss how to attempt the paper, which questions to pick, time management, reservation categories and cutoffs." },
            ...sharedHelp,
        ],
        expect: [
            { title: "Check-ins", body: "Your mentor will talk to you every 2 weeks." },
            ...sharedExpect,
        ],
    },
];

export const isMentorshipEnabled = (config: Pick<GroupConfig, "showMentorshipSupport">): boolean =>
    config.showMentorshipSupport === true;

/**
 * The homepage Resources tiles for a program. Programs without the mentorship
 * switch get exactly the tiles they had before (and none when the section is
 * off); programs with it get the Mentorship tile as the last tile.
 */
export const buildResourceTiles = (
    config: Pick<GroupConfig, "showResources" | "showMentorshipSupport">,
    resources: ResourceTile[]
): ResourceTile[] => [
    ...(config.showResources ? resources : []),
    ...(isMentorshipEnabled(config) ? [MENTORSHIP_TILE] : []),
];
