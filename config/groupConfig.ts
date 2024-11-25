import { GroupConfig, GroupConfigurations } from "@/app/types";

const groupConfig: GroupConfigurations = {
    AllIndiaStudents: {
        showLiveClasses: false,
        showTests: true,
        showPracticeTests: true,
        showHomework: false,
    },
    DelhiStudents: {
        showLiveClasses: true,
        showTests: true,
        showPracticeTests: true,
        showHomework: true,
    },
    defaultGroup: {
        showLiveClasses: true,
        showTests: true,
        showPracticeTests: true,
        showHomework: true,
    }
};

export const getGroupConfig = (group: string): GroupConfig => {
    return groupConfig[group] || groupConfig.defaultGroup;
};

export default groupConfig;