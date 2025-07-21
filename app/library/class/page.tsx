"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getSubjects, getClassChapters, getGrades, getResourcesOfChapter, getTeachers } from '../../../api/afdb/library';
import { Chapter, Resource, Teacher } from '../../types';
import { useEffect } from 'react';
import Link from 'next/link';
import { MdPlayCircleFilled } from 'react-icons/md';
import { IoIosArrowDown as ExpandIcon, IoIosArrowUp as CollapseIcon } from 'react-icons/io';
import { IoArrowBack } from 'react-icons/io5';
import { useSearchParams } from 'next/navigation';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';
import { Listbox } from '@headlessui/react';
import { IoIosArrowDown as DropdownArrow } from 'react-icons/io';

const ClassLibrary = () => {
    const [activeTab, setActiveTab] = useState('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [selectedGrade, setSelectedGrade] = useState(11);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<number | undefined>(undefined);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [chapterList, setChapterList] = useState<Chapter[]>([]);
    const gradeOptions = [11, 12];
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [loadingChapters, setLoadingChapters] = useState<Record<number, boolean>>({});
    const selectedCourse = searchParams.get('course');
    const neetSubjects = ['Physics', 'Chemistry', 'Biology'];
    const jeeSubjects = ['Physics', 'Chemistry', 'Maths'];

    const handleTabClick = async (tabName: string) => {
        setActiveTab(tabName);
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_TAB + ": " + tabName);
        if (activeTab != tabName) {
            setSelectedChapter(null)
            setSelectedTeacher(undefined)
        }

        try {
            const subjectData = await getSubjects(tabName);
            const gradeData = await getGrades(selectedGrade);
            const teacherData = await getTeachers(undefined, subjectData[0].id);
            setTeachers(teacherData);
            if (teacherData.length > 0 && selectedTeacher === undefined) {
                setSelectedTeacher(teacherData[0].id);
            }
            if (subjectData.length > 0) {
                const subjectId = subjectData[0].id;
                const gradeId = gradeData[0].id;

                await fetchChapters(subjectId, gradeId);
                const chapterData = selectedChapter
                    ? await getClassChapters(subjectId, gradeId, selectedChapter, selectedTeacher)
                    : await getClassChapters(subjectId, gradeId, undefined, selectedTeacher);

                if (chapterData.length > 0) {
                    setChapters(chapterData);
                }
                else {
                    setChapters([])
                }
            } else {
                console.log("Bad request")
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Fetch teachers when activeTab or selectedGrade changes
    useEffect(() => {
        if (!activeTab) return;
        const fetchTeachers = async () => {
            try {
                const subjectData = await getSubjects(activeTab);
                if (subjectData.length > 0) {
                    const teacherData = await getTeachers(undefined, subjectData[0].id);
                    setTeachers(teacherData);
                    if (teacherData.length > 0 && !selectedTeacher) {
                        setSelectedTeacher(teacherData[0].id);
                    }
                }
            } catch (error) {
                console.error('Error fetching teachers:', error);
            }
        };
        fetchTeachers();
    }, [activeTab, selectedGrade]);

    useEffect(() => {
        if (!activeTab || !selectedTeacher) return;
        const fetchData = async () => {
            try {
                setIsLoading(true);
                await handleTabClick(activeTab);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [activeTab, selectedGrade, selectedChapter, selectedTeacher]);

    const handleTeacherChange = async (selectedTeacherId: number) => {
        setSelectedTeacher(selectedTeacherId);
        const teacherName = await getTeachers(selectedTeacherId);
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_TEACHER + ": " + teacherName[0].user.first_name);
    };

    const handleChapterClick = async (chapterId: number, chapterName: string) => {
        try {
            const resourceData = await getResourcesOfChapter(chapterId, selectedTeacher);
            setResources(resourceData);
            MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_CHAPTER + ": " + chapterName);
        } catch (error) {
            console.error('Error fetching chapter data:', error);
        }
    };

    const toggleChapterExpansion = async (chapterId: number, chapterName: string) => {
        setExpandedChapters((prevExpanded) => ({
            ...prevExpanded,
            [chapterId]: !prevExpanded[chapterId],
        }));

        // If expanding the chapter, show loading state
        if (!expandedChapters[chapterId]) {
            setLoadingChapters(prev => ({ ...prev, [chapterId]: true }));
            try {
                await handleChapterClick(chapterId, chapterName);
            } finally {
                setLoadingChapters(prev => ({ ...prev, [chapterId]: false }));
            }
        }
    };

    const handleBackClick = () => {
        router.push('/library');
    };

    const handleGradeChange = (grade: number) => {
        setSelectedGrade(grade);
        setSelectedChapter(null)
        MixpanelTracking.getInstance().trackEvent('Selected grade: ' + grade);
    };

    const fetchChapters = async (subjectId: number, gradeId: number) => {
        const chapterData = await getClassChapters(subjectId, gradeId, undefined, selectedTeacher);
        setChapterList(chapterData);
    };

    const handleResourceTracking = (resourceName: any) => {
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_RESOURCE + ": " + resourceName)
    }

    const generateSubjectButton = (subject: string, label: string) => (
        <PrimaryButton
            key={subject}
            onClick={() => handleTabClick(subject)}
            className={`py-2 px-4 rounded-lg ${activeTab === subject ? 'bg-heading text-primary font-semibold shadow-sm' : 'bg-white text-slate-600'}`}
        >
            {label}
        </PrimaryButton>
    );

    // Set default subject based on course on mount and whenever course changes
    useEffect(() => {
        let defaultTab = '';
        if (selectedCourse === 'JEE Classes' || selectedCourse === 'NEET Classes') {
            defaultTab = 'Physics';
        }
        setActiveTab(defaultTab);
    }, [selectedCourse]);

    // Common dropdown class for consistent styling
    const DROPDOWN_CLASS = "w-32 h-8 rounded-lg text-center bg-white border border-gray-300 shadow focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-150";

    return (
        <>
            <main className="max-w-xl mx-auto bg-white min-h-screen">
                <TopBar />
                <div className="bg-heading text-primary h-20 flex flex-col">
                    <div className='flex items-center mx-4 mt-4'>
                        <IoArrowBack onClick={handleBackClick} className="w-7 h-7 cursor-pointer" />
                        <h1 className="font-semibold ml-2 text-xl">{selectedCourse === 'NEET Classes' ? "NEET Classes" : "JEE Classes"}<br /></h1>
                    </div>
                    <span className="text-sm ml-[52px] font-normal">Class Library</span>
                </div>
                <div className="flex flex-row my-4 justify-between mx-6">
                    {selectedCourse === 'NEET Classes' && neetSubjects.map(subject => generateSubjectButton(subject, subject))}
                    {selectedCourse === 'JEE Classes' && jeeSubjects.map(subject => generateSubjectButton(subject, subject))}
                </div>
                <div className="bg-heading h-20 flex items-center w-full">
                    <div className="mx-5 w-full flex justify-between items-center">
                        <Listbox value={selectedGrade} onChange={handleGradeChange}>
                            <div className="relative">
                                <Listbox.Button className={`${DROPDOWN_CLASS} pr-6`}>
                                    <span>Grade {selectedGrade}</span>
                                    <DropdownArrow className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" />
                                </Listbox.Button>
                                <Listbox.Options className="absolute mt-1 w-32 bg-white rounded-lg shadow z-10 border border-gray-300">
                                    {gradeOptions.map((grade) => (
                                        <Listbox.Option
                                            key={grade}
                                            value={grade}
                                            className={({ active }) =>
                                                `cursor-pointer select-none px-4 py-2 ${active ? 'bg-primary text-white' : 'text-gray-900'}`
                                            }
                                        >
                                            Grade {grade}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                        <Listbox value={selectedChapter} onChange={setSelectedChapter}>
                            <div className="relative">
                                <Listbox.Button className={`${DROPDOWN_CLASS} truncate pr-6`}>
                                    <span>{selectedChapter ? `Chapter: ${chapterList.find(c => c.id === selectedChapter)?.name}` : 'Chapter: All'}</span>
                                    <DropdownArrow className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" />
                                </Listbox.Button>
                                <Listbox.Options className="absolute mt-1 w-60 bg-white rounded-lg shadow z-10 border border-gray-300 max-h-60 overflow-auto right-0">
                                    <Listbox.Option value={null} className={({ active }) =>
                                        `cursor-pointer select-none px-4 py-2 ${active ? 'bg-primary text-white' : 'text-gray-900'}`
                                    }>
                                        Chapter: All
                                    </Listbox.Option>
                                    {chapterList.map((chapter) => (
                                        <Listbox.Option
                                            key={chapter.id}
                                            value={chapter.id}
                                            className={({ active }) =>
                                                `cursor-pointer select-none px-4 py-2 ${active ? 'bg-primary text-white' : 'text-gray-900'}`
                                            }
                                        >
                                            {chapter.name}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    </div>
                </div>
                <div className="bg-heading h-20 flex items-center w-full -mt-8">
                    <div className="mx-5 w-full flex justify-between items-center">
                        <Listbox value={selectedTeacher} onChange={handleTeacherChange}>
                            <div className="relative">
                                <Listbox.Button className={`${DROPDOWN_CLASS} pr-6`}>
                                    <span>{teachers.find(t => t.id === selectedTeacher)?.user.first_name || 'Select Teacher'}</span>
                                    <DropdownArrow className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4" />
                                </Listbox.Button>
                                <Listbox.Options className="absolute mt-1 w-40 bg-white rounded-lg shadow z-10 border border-gray-300 max-h-60 overflow-auto right-0">
                                    {teachers.map((teacher) => (
                                        <Listbox.Option
                                            key={teacher.id}
                                            value={teacher.id}
                                            className={({ active }) =>
                                                `cursor-pointer select-none px-4 py-2 ${active ? 'bg-primary text-white' : 'text-gray-900'}`
                                            }
                                        >
                                            {teacher.user.first_name}
                                        </Listbox.Option>
                                    ))}
                                </Listbox.Options>
                            </div>
                        </Listbox>
                    </div>
                </div>
                {isLoading ? (
                    <Loading showLibraryOnly={true} />
                ) : (
                    <div className="mt-4 pb-40">
                        {chapters.length > 0 ? (chapters.map((chapter) => (
                            <div key={chapter.id} className="mx-5">
                                <div
                                    className="text-md font-semibold mt-2 bg-primary text-white cursor-pointer px-4 py-4 mb-4 flex flex-row justify-between items-center"
                                    onClick={() => toggleChapterExpansion(chapter.id, chapter.name)}
                                >
                                    <div className="w-52">{chapter.name}</div>
                                    <div className="w-8 flex justify-center">
                                        {expandedChapters[chapter.id] ? (
                                            <CollapseIcon className="w-6 h-6" />
                                        ) : (
                                            <ExpandIcon className="w-6 h-6" />
                                        )}
                                    </div>
                                </div>
                                {expandedChapters[chapter.id] && (
                                    <div className="m-2">
                                        {loadingChapters[chapter.id] ? (
                                            <Loading showChapterContentOnly={true} cardCount={2} />
                                        ) : (
                                            <ul className="text-primary font-normal">
                                                {resources
                                                    .filter((resource) => resource.chapter_id === chapter.id && resource.link && resource.type === 'video' && resource.subtype === 'classRecording')
                                                    .map((resource) => (
                                                        <li key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2 text-primary pl-4 flex items-center">
                                                            <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center">
                                                                <MdPlayCircleFilled className="w-10 h-10 mr-2" color="#ef4444" /> {resource.name} {resource.type_params?.date ? `- ${resource.type_params.date}` : ''}
                                                            </Link>
                                                        </li>
                                                    ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))) : <div className="text-center pt-10">
                            No chapters available
                        </div>
                        }
                        <BottomNavigationBar />
                    </div>
                )}
            </main>
        </>
    );
};

export default ClassLibrary;
