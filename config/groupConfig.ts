import { GroupConfig, GroupConfigurations } from "@/app/types";

const groupConfig: GroupConfigurations = {
    AllIndiaStudents: {
        showLiveClasses: false,
        showTests: true,
        showPracticeTests: true,
        showHomework: false,
        showContentLibrary: true,
        showClassLibrary: false,
    },
    EnableStudents: {
        showLiveClasses: true,
        showTests: true,
        showPracticeTests: true,
        showHomework: true,
        showContentLibrary: true,
        showClassLibrary: false,
    },
    DelhiStudents: {
        showLiveClasses: true,
        showTests: true,
        showPracticeTests: true,
        showHomework: true,
        showContentLibrary: true,
        showClassLibrary: true,
    },
    defaultGroup: {
        showLiveClasses: true,
        showTests: true,
        showPracticeTests: true,
        showHomework: true,
        showContentLibrary: true,
        showClassLibrary: true,
    },
    ChhattisgarhStudents: {
        showLiveClasses: false,
        showTests: true,
        showPracticeTests: true,
        showHomework: true,
        showContentLibrary: true,
        showClassLibrary: false,
    },
};

export const getGroupConfig = (group: string): GroupConfig => {
    return groupConfig[group] || groupConfig.defaultGroup;
};

export default groupConfig;