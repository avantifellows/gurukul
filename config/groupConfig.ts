import { GroupConfig, GroupConfigurations } from "@/app/types";

const groupConfig: GroupConfigurations = {
    AllIndiaStudents: {
        showLiveClasses: false,
        showTests: true,
        showPracticeTests: true,
        showHomework: false,
        showContentLibrary: true,
        showClassLibrary: false,
        testsSectionTitle: 'Tests',
        homeTabLabel: 'Home',
    },
    EnableStudents: {
        showLiveClasses: false,
        showTests: true,
        showPracticeTests: true,
        showHomework: false,
        showContentLibrary: true,
        showClassLibrary: false,
        testsSectionTitle: 'NVS Live Test',
        homeTabLabel: 'Tests',
    },
    EnableSchools: {
        showLiveClasses: false,
        showTests: false,
        showPracticeTests: false,
        showHomework: false,
        showContentLibrary: true,
        showClassLibrary: false,
        testsSectionTitle: 'Tests',
        homeTabLabel: 'Home',
        showHomeTab: false,
    },
    DelhiStudents: {
        showLiveClasses: true,
        showTests: true,
        showPracticeTests: true,
        showHomework: true,
        showContentLibrary: true,
        showClassLibrary: false,
        testsSectionTitle: 'Tests',
        homeTabLabel: 'Home',
    },
    defaultGroup: {
        showLiveClasses: true,
        showTests: true,
        showPracticeTests: true,
        showHomework: true,
        showContentLibrary: true,
        showClassLibrary: false,
        testsSectionTitle: 'Tests',
        homeTabLabel: 'Home',
    },
    ChhattisgarhStudents: {
        showLiveClasses: false,
        showTests: true,
        showPracticeTests: true,
        showHomework: false,
        showContentLibrary: true,
        showClassLibrary: false,
        testsSectionTitle: 'Tests',
        homeTabLabel: 'Home',
    },
};

export const getGroupConfig = (group: string): GroupConfig => {
    return groupConfig[group] || groupConfig.defaultGroup;
};

export default groupConfig;