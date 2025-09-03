export const CURRICULUM_NAMES = {
    JEE: 'JEE Mains',
    NEET: 'NEET',
    CA: 'CA',
    CLAT: 'CLAT',
    GRADE_9: 'Grade 9 - Foundation',
    GRADE_10: 'Grade 10 - Foundation',
    CUET: 'CUET',
    NDA: 'NDA',
} as const;

export const COURSES = {
    JEE: 'JEE Content' as const,
    NEET: 'NEET Content' as const,
    CA: 'CA Content' as const,
    CLAT: 'CLAT Content' as const,
    GRADE_9: 'Grade 9 Foundation' as const,
    GRADE_10: 'Grade 10 Foundation' as const,
    CUET: 'CUET' as const,
    NDA: 'NDA' as const,
} as const;

export const MIXPANEL_EVENT = {
    REPORTS_PAGE_VIEW: "Reports Page View",
    SELECTED_LIBRARY: "Selected Library",
    SELECTED_TAB: "Selected Tab",
    SELECTED_CHAPTER: "Selected Chapter",
    SELECTED_GRADE: "Selected Grade",
    SELECTED_RESOURCE: "Selected Resource",
    LOGOUT: "User logged out",
    SELECTED_TEACHER: "Selected Teacher",
    USER_IDENTIFIED: "User Identified"
};