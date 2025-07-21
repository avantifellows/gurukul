"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getSubjects, getChapters, getGrades, getChapterResourcesComplete } from '../../../api/afdb/library';
import { Chapter, Resource, Topic } from '../../types';
import Link from 'next/link';
import { MdMenuBook, MdQuiz, MdPlayCircleFilled, MdInsertDriveFile } from 'react-icons/md';
import { GiArchiveRegister } from 'react-icons/gi';
import { IoIosArrowDown as ExpandIcon, IoIosArrowUp as CollapseIcon } from 'react-icons/io';
import { IoArrowBack } from 'react-icons/io5';
import { useSearchParams } from 'next/navigation';
import { COURSES } from '@/constants/config';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';
import { Listbox } from '@headlessui/react';
import { IoIosArrowDown as DropdownArrow } from 'react-icons/io';

// Helper to get icon, prefix, and color for a resource
const getResourceIconAndPrefix = (resource: Resource) => {
    if (resource.type === 'document' && resource.subtype === 'Module') {
        return { icon: MdMenuBook, prefix: 'Module:', color: '#2563eb' };
    }
    if (resource.type === 'document' && resource.subtype === 'Previous Year Questions') {
        return { icon: GiArchiveRegister, prefix: 'PYQ:', color: '#f59e42' };
    }
    if (resource.type === 'quiz' && resource.subtype === 'Assessment') {
        return { icon: MdQuiz, prefix: 'Practice Test:', color: '#a21caf' };
    }
    if (resource.type === 'video' && resource.subtype === 'Video Lectures') {
        return { icon: MdPlayCircleFilled, prefix: 'Video:', color: '#ef4444' };
    }
    // fallback
    return { icon: MdInsertDriveFile, prefix: '', color: '#64748b' };
};

// Common dropdown class for consistent styling
const DROPDOWN_CLASS = "w-32 h-8 rounded-lg text-center bg-white border border-gray-300 shadow focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all duration-150";

const ContentLibrary = () => {
    const [activeTab, setActiveTab] = useState('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [chapterResources, setChapterResources] = useState<Resource[]>([]);
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [selectedGrade, setSelectedGrade] = useState(11);
    const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
    const [chapterList, setChapterList] = useState<Chapter[]>([]);
    const gradeOptions = [11, 12];
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [expandedChapterLoading, setExpandedChapterLoading] = useState<Record<number, boolean>>({});
    const selectedCourse = searchParams.get('course');
    const neetSubjects = ['Physics', 'Chemistry', 'Biology'];
    const jeeSubjects = ['Physics', 'Chemistry', 'Maths'];
    const caSubjects = ['Accounting', 'Business Economics', 'Quantitative Aptitude'];
    const clatSubjects = ['English', 'Logical Reasoning', 'Quantitative Aptitude'];
    const prevCourseRef = useRef<string | null>(null);

    const handleTabClick = async (tabName: string) => {
        setActiveTab(tabName);
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_TAB + ": " + tabName);
        if (activeTab != tabName) {
            setSelectedChapter(null)
        }

        try {
            const subjectData = await getSubjects(tabName);
            const gradeData = await getGrades(selectedGrade);
            if (subjectData.length > 0) {
                const subjectId = subjectData[0].id;
                const gradeId = gradeData[0].id;
                await fetchChapters(subjectId, gradeId);
                const chapterData = selectedChapter
                    ? await getChapters(subjectId, gradeId, selectedChapter)
                    : await getChapters(subjectId, gradeId);

                if (chapterData.length > 0) {
                    setChapters(chapterData);
                }
                else {
                    setChapters([]);
                }
            } else {
                setChapters([]);
                console.log("Bad request")
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        if (!activeTab) return;
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
    }, [selectedCourse, activeTab, selectedGrade, selectedChapter]);

    // Set default subject based on course on mount and whenever course changes
    useEffect(() => {
        let defaultTab = '';
        if (selectedCourse === COURSES.JEE || selectedCourse === COURSES.NEET) {
            defaultTab = 'Physics';
        } else if (selectedCourse === COURSES.CA) {
            defaultTab = 'Accounting';
        } else if (selectedCourse === COURSES.CLAT) {
            defaultTab = 'English';
        }
        setActiveTab(defaultTab);
    }, [selectedCourse]);

    const handleChapterClick = async (chapterId: number, chapterName: string) => {
        try {
            const { topics, topicResources, chapterResources } = await getChapterResourcesComplete(chapterId);
            setTopics(topics);
            setResources(topicResources);
            setChapterResources(chapterResources);
            MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_CHAPTER + ": " + chapterName);
        } catch (error) {
            console.error('Error fetching chapter data:', error);
        }
    };

    const toggleChapterExpansion = async (chapterId: number, chapterName: string) => {
        setExpandedChapters({
            [chapterId]: !expandedChapters[chapterId],
        });

        if (!expandedChapters[chapterId]) {
            setExpandedChapterLoading({ [chapterId]: true });
            setChapterResources([]);
            setTopics([]);
            setResources([]);

            await handleChapterClick(chapterId, chapterName);
            setExpandedChapterLoading({ [chapterId]: false });
        } else {
            // Clear data when closing the chapter
            setChapterResources([]);
            setTopics([]);
            setResources([]);
            setExpandedChapterLoading({});
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
        const chapterData = await getChapters(subjectId, gradeId);
        setChapterList(chapterData);
    };

    const handleResourceTracking = (resourceName: any) => {
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_RESOURCE + ": " + resourceName)
    }

    const generateSubjectButton = (subject: string, label: string) => (
        <PrimaryButton
            key={subject}
            onClick={() => handleTabClick(subject)}
            className={`py-2 px-2 w-full h-full rounded-lg text-center break-words ${activeTab === subject ? 'bg-heading text-primary font-semibold shadow-sm' : 'bg-white text-slate-600'}`}
        >
            {label}
        </PrimaryButton>
    );

    return (
        <>
            <main className="max-w-xl mx-auto bg-white min-h-screen">
                <TopBar />
                <div className="bg-heading text-primary h-20 flex flex-col">
                    <div className='flex items-center mx-4 mt-4'>
                        <IoArrowBack onClick={handleBackClick} className="w-7 h-7 cursor-pointer" />
                        <h1 className="font-semibold ml-2 text-xl">
                            {selectedCourse === COURSES.NEET && "NEET Course"}
                            {selectedCourse === COURSES.JEE && "JEE Course"}
                            {selectedCourse === COURSES.CA && "CA Course"}
                            {selectedCourse === COURSES.CLAT && "CLAT Course"}
                            <br />
                        </h1>
                    </div>
                    <span className="text-sm ml-[52px] font-normal">Content Library</span>
                </div>
                <div className="mx-5">
                    <div className="grid grid-cols-3 gap-2 mt-4 mb-4">
                        {selectedCourse === COURSES.NEET && neetSubjects.map(subject => generateSubjectButton(subject, subject))}
                        {selectedCourse === COURSES.JEE && jeeSubjects.map(subject => generateSubjectButton(subject, subject))}
                        {selectedCourse === COURSES.CA && caSubjects.map(subject => generateSubjectButton(subject, subject))}
                        {selectedCourse === COURSES.CLAT && clatSubjects.map(subject => generateSubjectButton(subject, subject))}
                    </div>
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

                        {/* Chapter Dropdown - Right extreme */}
                        <Listbox value={selectedChapter} onChange={setSelectedChapter}>
                            <div className="relative">
                                <Listbox.Button className={`${DROPDOWN_CLASS} truncate pr-6 px-3`}>
                                    <span>{selectedChapter ? `${chapterList.find(c => c.id === selectedChapter)?.name}` : 'Chapter: All'}</span>
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
                {isLoading ? (
                    <Loading showLibraryOnly={true} />
                ) : (
                    <div className="mt-4 pb-40 mx-5">
                        {chapters.length === 0 ? (
                            <div className="text-center pt-10">No chapters available</div>
                        ) : (
                            chapters.map((chapter) => (
                                <div key={chapter.id}>
                                    <div
                                        className="text-md font-semibold mt-2 bg-primary text-white cursor-pointer px-4 py-4 mb-4 flex flex-row justify-between items-center"
                                        onClick={() => toggleChapterExpansion(chapter.id, chapter.name)}
                                    >
                                        <div className="flex-1 min-w-0 mr-4 break-words">{chapter.name}</div>
                                        <div className="w-8 flex justify-center">
                                            {expandedChapters[chapter.id] ? (
                                                <CollapseIcon className="w-6 h-6" />
                                            ) : (
                                                <ExpandIcon className="w-6 h-6" />
                                            )}
                                        </div>
                                    </div>
                                    {expandedChapters[chapter.id] && (
                                        <div className="mb-8">
                                            {expandedChapterLoading[chapter.id] ? (
                                                <Loading showChapterContentOnly={true} />
                                            ) : (
                                                <ul>
                                                    {/* Render modules for the chapter */}
                                                    {[...chapterResources].sort((a, b) => {
                                                        // Modules first
                                                        if (a.type === 'document' && a.subtype === 'Module') return -1;
                                                        if (b.type === 'document' && b.subtype === 'Module') return 1;
                                                        return 0;
                                                    }).map((resource) => {
                                                        const { icon: Icon, prefix, color } = getResourceIconAndPrefix(resource);
                                                        return (
                                                            <li key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2 text-primary pl-4 flex items-center">
                                                                <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center">
                                                                    {React.createElement(Icon, { className: 'w-10 h-10 mr-2', color })} {prefix} {resource.name}
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}

                                                    {/* If there are topics for this chapter, render topic cards. Otherwise, render non-module resources directly. */}
                                                    {topics.filter((topic) => topic.chapter_id === chapter.id).length > 0 ? (
                                                        topics
                                                            .filter((topic) => topic.chapter_id === chapter.id)
                                                            .map((topic) => {
                                                                const videos = resources.filter(
                                                                    (resource) => resource.topic_id === topic.id &&
                                                                        resource.link &&
                                                                        !(resource.type === 'document' && resource.subtype === 'Module')
                                                                );

                                                                return (
                                                                    <div key={topic.id} className="bg-card rounded-lg shadow-lg shadow-slate-400 p-4 mx-2 mt-2 my-8 text-black font-semibold">
                                                                        <h3>{topic.name}</h3>
                                                                        <ul className="text-primary m-2 font-normal">
                                                                            {videos.map((resource) => {
                                                                                const { icon: Icon, prefix, color } = getResourceIconAndPrefix(resource);
                                                                                return (
                                                                                    <li key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2 text-primary pl-4 flex items-center">
                                                                                        <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center">
                                                                                            {React.createElement(Icon, { className: 'w-10 h-10 mr-2', color })} {prefix} {resource.name}
                                                                                        </Link>
                                                                                    </li>
                                                                                );
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                );
                                                            })
                                                    ) : (
                                                        // No topics: show all non-module chapter resources directly
                                                        chapterResources.length === 0 && (
                                                            <li className="py-2 text-slate-500 pl-4">No resources available for this chapter.</li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                        <BottomNavigationBar />
                    </div>
                )}
            </main>
        </>
    );
};

export default ContentLibrary;
