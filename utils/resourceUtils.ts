import { Resource, Chapter, ChapterCurriculum, ChapterPriority, Subject, Topic } from '../app/types';

/**
 * Generic helper function to get name from any resource with a name array
 * Prioritizes English names, falls back to first available name
 */
const getNameFromArray = <T extends { name: Array<{ lang_code: string;[key: string]: any }> }>(
    item: T,
    nameKey: string,
    defaultName: string
): string => {
    if (Array.isArray(item.name)) {
        // Try to find English name first
        const englishName = item.name.find(name => name.lang_code === 'en');
        if (englishName) {
            return englishName[nameKey];
        }
        // Fallback to first available name
        if (item.name.length > 0) {
            return item.name[0][nameKey];
        }
    }
    // Fallback for old structure or empty array
    return defaultName;
};

/**
 * Helper function to get resource name from the name array
 * Prioritizes English names, falls back to first available name
 */
export const getResourceName = (resource: Resource): string => {
    return getNameFromArray(resource, 'resource', 'Untitled Resource');
};

/**
 * Helper function to get chapter name from the name array
 * Prioritizes English names, falls back to first available name
 */
export const getChapterName = (chapter: Chapter): string => {
    return getNameFromArray(chapter, 'chapter', 'Untitled Chapter');
};

/**
 * Helper function to get subject name from the name array
 * Prioritizes English names, falls back to first available name
 */
export const getSubjectName = (subject: Subject): string => {
    return getNameFromArray(subject, 'resource', 'Untitled Subject');
};

/**
 * Helper function to get topic name from the name array
 * Prioritizes English names, falls back to first available name
 */
export const getTopicName = (topic: Topic): string => {
    return getNameFromArray(topic, 'topic', 'Untitled Topic');
};

const CHAPTER_PRIORITIES: ChapterPriority[] = ['high', 'medium', 'low'];

/**
 * Normalise the free-text priority recorded in db-service into one of the
 * three values the UI knows how to render. The column is a plain string with
 * no constraint, so anything unexpected is treated as "not prioritised"
 * rather than rendered raw.
 */
export const normalizeChapterPriority = (value?: string | null): ChapterPriority | null => {
    if (!value) return null;
    const normalized = value.trim().toLowerCase();
    return CHAPTER_PRIORITIES.find((priority) => priority === normalized) ?? null;
};

/**
 * Pick the priority a chapter carries for one specific curriculum.
 * `/chapter` returns every curriculum mapping for a chapter, so reading the
 * first entry would show another exam's priority.
 */
export const resolveChapterPriority = (
    curriculums: ChapterCurriculum[] | undefined,
    curriculumId?: number | null
): ChapterPriority | null => {
    if (!Array.isArray(curriculums) || !curriculumId) return null;
    const match = curriculums.find((curriculum) => curriculum.curriculum_id === curriculumId);
    return normalizeChapterPriority(match?.priority_text);
};

/**
 * Groups that sit their practice tests in Sashakt rather than the Avanti quiz
 * engine. A chapter whose test has been twinned carries one row per player, so
 * without this every student would see the same practice test listed twice.
 */
// The groups whose students get the Sashakt rendering of a practice test when
// both players carry it. Everyone else stays on the quiz engine. Names are the
// identity.group value from the login token, not a display label.
//
// HaryanaStudents has not logged in since July 2026; it is listed so that the
// group lands on Sashakt if it comes back, rather than being missed later.
const SASHAKT_GROUPS = new Set([
    'AllIndiaStudents',
    'DelhiStudents',
    'DishaStudents',
    'GujaratStudents',
    'HaryanaStudents',
    'HimachalStudents',
    'MaharashtraStudents',
    'OLFStudents',
    'PunjabStudents',
    'UttarakhandStudents',
]);

const isSashaktLink = (link?: string): boolean => {
    if (!link) return false;
    const sashaktUrl =
        process.env.NEXT_PUBLIC_AF_SASHAKT_URL || 'https://assessment.sashakt.in';
    return link.startsWith(sashaktUrl);
};

/**
 * Keep one player's copy of each twinned practice test.
 *
 * The same test can exist as two active rows -- one quiz-engine link, one
 * Sashakt link -- because Gurukul chooses the player from the link itself.
 * Both rows are legitimate and both are active, so the Library has to pick:
 * Sashakt for the groups piloting it, the quiz engine for everyone else.
 *
 * Rows are matched on name within a chapter, since the twin is published with
 * the same name as the row it mirrors. A resource with no counterpart is left
 * alone whichever player it points at, so a chapter that exists only in one
 * player still shows up.
 */
export const filterResourcesByPlayer = (
    resources: Resource[],
    group?: string | null
): Resource[] => {
    const preferSashakt = !!group && SASHAKT_GROUPS.has(group);

    const counterpart = new Map<string, boolean>();
    resources.forEach((resource) => {
        if (resource.type !== 'quiz') return;
        const key = `${resource.chapter_id ?? ''}::${getResourceName(resource)}`;
        const seenSashakt = counterpart.get(key) ?? false;
        counterpart.set(key, seenSashakt || isSashaktLink(resource.link));
    });

    return resources.filter((resource) => {
        if (resource.type !== 'quiz') return true;
        const key = `${resource.chapter_id ?? ''}::${getResourceName(resource)}`;
        const sashakt = isSashaktLink(resource.link);
        // Only one flavour present for this test: nothing to choose between.
        const hasBoth =
            counterpart.get(key) === true &&
            resources.some(
                (other) =>
                    other.type === 'quiz' &&
                    `${other.chapter_id ?? ''}::${getResourceName(other)}` === key &&
                    !isSashaktLink(other.link)
            );
        if (!hasBoth) return true;
        return sashakt === preferSashakt;
    });
};

/**
 * Build final link for a resource.
 * Quiz resources go through a Gurukul server route that mints a short-lived
 * quiz launch token from the existing portal auth cookie.
 * Returns undefined if resource.link is missing.
 */
export const buildResourceLink = (resource: Resource): string | undefined => {
    if (!resource.link) return undefined;
    if (resource.type !== 'quiz') return resource.link;
    const params = new URLSearchParams({ url: resource.link }).toString();
    // A quiz resource can point at either quiz engine or Sashakt; each has its
    // own launch route because the two mint a session in different ways.
    const sashaktUrl =
        process.env.NEXT_PUBLIC_AF_SASHAKT_URL || 'https://assessment.sashakt.in';
    if (resource.link.startsWith(sashaktUrl)) {
        return `/api/sashakt-launch?${params}`;
    }
    return `/api/quiz-launch?${params}`;
};

/**
 * Build final link for a student report.
 * Reports go through a Gurukul server route that mints a short-lived report
 * launch token from the existing portal auth cookie, so the report resolves
 * the student itself and can offer the "Review Quiz" handoff.
 */
export const buildReportLink = (reportLink: string): string => {
    if (!reportLink) return reportLink;
    const params = new URLSearchParams({ url: reportLink }).toString();
    return `/api/report-launch?${params}`;
};
