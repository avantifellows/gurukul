import { Resource, Chapter, Subject, Topic } from '../app/types';

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
    return getNameFromArray(topic, 'resource', 'Untitled Topic');
};
