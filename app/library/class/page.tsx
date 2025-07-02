"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getSubjects, getClassChapters, getGrades, getResourcesOfChapter, getTeachers } from '../../../api/afdb/library';
import { Chapter, Resource, Topic, Teacher } from '../../types';
import { useEffect } from 'react';
import Link from 'next/link';
import ExpandIcon from "../../../assets/expand.png";
import CollapseIcon from "../../../assets/collapse.png";
import PlayIcon from "../../../assets/play.png";
import { IoArrowBack } from 'react-icons/io5';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';

const ClassLibrary = () => {
    const [activeTab, setActiveTab] = useState('Physics');
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
            const actualTabName = tabName.toLowerCase();
            const subjectData = await getSubjects(actualTabName);
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

    useEffect(() => {
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
    }, [selectedGrade, selectedChapter, selectedTeacher]);

    const handleTeacherChange = async (selectedTeacherId: number) => {
        setSelectedTeacher(selectedTeacherId);
        const teacherName = await getTeachers(selectedTeacherId);
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_TEACHER + ": " + teacherName[0].user.first_name);
    };

    const handleChapterClick = async (chapterId: number, chapterName: string) => {
        try {
            const resourceData = await getResourcesOfChapter(chapterId, 'class', selectedTeacher);
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

    return (
        <>
            <main className="max-w-xl mx-auto lg:max-w-none lg:mx-0 lg:p-6 bg-white lg:bg-transparent min-h-screen">
                <TopBar />
                <div className="bg-heading lg:bg-transparent text-primary h-20 lg:h-auto flex flex-col lg:mb-6">
                    <div className='flex items-center mx-4 lg:mx-0 mt-4 lg:mt-0'>
                        <IoArrowBack onClick={handleBackClick} className="w-7 h-7 lg:w-8 lg:h-8 cursor-pointer hover:opacity-75 transition-opacity duration-200" />
                        <h1 className="font-semibold ml-2 text-xl lg:text-2xl">{selectedCourse === 'NEET Classes' ? "NEET Classes" : "JEE Classes"}<br /></h1>
                    </div>
                    <span className="text-sm lg:text-base ml-[52px] lg:ml-10 font-normal lg:text-gray-600">Class Library</span>
                </div>
                <div className="flex flex-row my-4 justify-between lg:justify-center lg:gap-4 mx-6 lg:mx-0">
                    {selectedCourse === 'NEET Classes' && neetSubjects.map(subject => generateSubjectButton(subject, subject))}
                    {selectedCourse === 'JEE Classes' && jeeSubjects.map(subject => generateSubjectButton(subject, subject))}
                </div>
                <div className="bg-heading lg:bg-gray-50 lg:rounded-lg h-20 lg:h-16 flex justify-between lg:justify-center lg:gap-8 items-center px-4 lg:px-6 lg:mb-4">
                    <select
                        onChange={(e) => handleGradeChange(+e.target.value)}
                        value={selectedGrade}
                        className="w-32 lg:w-40 h-8 lg:h-10 rounded-lg text-center lg:text-base hover:shadow-md transition-shadow duration-200"
                    >
                        {gradeOptions.map((grade) => (
                            <option key={grade} value={grade} className="text-sm md:text-lg">
                                Grade {grade}
                            </option>
                        ))}
                    </select>
                    <select
                        onChange={(e) => setSelectedChapter(+e.target.value)}
                        value={selectedChapter || ''}
                        className="w-32 lg:w-40 h-8 lg:h-10 rounded-lg text-center lg:text-base hover:shadow-md transition-shadow duration-200"
                    >
                        <option value="" className="text-sm md:text-lg">Chapter: All</option>
                        {chapterList.map((chapter) => (
                            <option key={chapter.id} value={chapter.id} className="text-sm md:text-lg">
                                {chapter.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="bg-heading lg:bg-gray-50 lg:rounded-lg pb-6 lg:pb-4 lg:pt-4 flex justify-between lg:justify-center items-center px-4 lg:px-6 lg:mb-6">
                    <select
                        onChange={(e) => handleTeacherChange(+e.target.value)}
                        value={selectedTeacher}
                        className="w-32 lg:w-40 h-8 lg:h-10 rounded-lg text-center lg:text-base hover:shadow-md transition-shadow duration-200"
                    >
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id} className="text-sm md:text-lg">
                                {teacher.user.first_name}
                            </option>
                        ))}
                    </select>
                </div>
                {isLoading ? (
                    <Loading showLibraryOnly={true} />
                ) : (
                    <div className="mt-4 pb-40 lg:pb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 lg:gap-6">
                            {chapters.length > 0 ? (chapters.map((chapter) => (
                                <div key={chapter.id} className="mx-5 lg:mx-0">
                                    <div
                                        className="text-md lg:text-lg font-semibold mt-2 bg-primary text-white cursor-pointer px-4 lg:px-6 py-4 lg:py-5 mb-4 flex flex-row justify-between items-center rounded-lg lg:hover:bg-primary/90 transition-colors duration-200"
                                        onClick={() => toggleChapterExpansion(chapter.id, chapter.name)}
                                    >
                                        <div className="w-52 lg:flex-1">{chapter.name}</div>
                                        <div className="w-8 lg:w-10 flex justify-center">
                                            {expandedChapters[chapter.id] ? (
                                                <Image src={CollapseIcon} alt="Collapse" className="lg:w-6 lg:h-6" />
                                            ) : (
                                                <Image src={ExpandIcon} alt="Expand" className="lg:w-6 lg:h-6" />
                                            )}
                                        </div>
                                    </div>
                                    {expandedChapters[chapter.id] && (
                                        <div className="m-2 lg:bg-gray-50 lg:p-6 lg:rounded-lg lg:ml-0">
                                            {loadingChapters[chapter.id] ? (
                                                <Loading showChapterContentOnly={true} cardCount={2} />
                                            ) : (
                                                <div className="text-primary font-normal lg:grid lg:grid-cols-1 xl:grid-cols-2 lg:gap-4 space-y-2 lg:space-y-0">
                                                    {resources
                                                        .filter((resource) => resource.chapter_id === chapter.id && resource.link)
                                                        .map((resource) => (
                                                            <div key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2 lg:py-0">
                                                                <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center hover:bg-white lg:hover:bg-gray-100 p-2 lg:p-4 rounded-lg transition-colors duration-200 bg-white lg:bg-white shadow-sm lg:shadow-md hover:shadow-md lg:hover:shadow-lg">
                                                                    <Image src={PlayIcon} alt="Play" className="w-10 h-10 lg:w-12 lg:h-12 mr-2 lg:mr-4" /> 
                                                                    <div className="flex flex-col">
                                                                        <span className="lg:text-base font-medium">{resource.name}</span>
                                                                        <span className="text-sm text-gray-600">{resource.type_params?.date || 'Date not available'}</span>
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                            ))) : <div className="text-center pt-10 lg:col-span-full">
                                No chapters available
                            </div>
                            }
                        </div>
                        <BottomNavigationBar />
                    </div>
                )}
            </main>
        </>
    );
};

export default ClassLibrary;
