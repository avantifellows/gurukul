"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getCurriculum, getSubjects, getChapters, getGrades, getChapterResourcesComplete } from '../../../api/afdb/library';
import { Chapter, Resource, Topic } from '../../types';
import { useEffect } from 'react';
import Link from 'next/link';
import ExpandIcon from "../../../assets/expand.png";
import CollapseIcon from "../../../assets/collapse.png";
import PlayIcon from "../../../assets/play.png";
import { IoArrowBack } from 'react-icons/io5';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CURRICULUM_NAMES, COURSES } from '@/constants/config';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';
import ModuleIcon from '../../../assets/notepad.png'

const ContentLibrary = () => {
    const [activeTab, setActiveTab] = useState('Physics');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [chapterResources, setChapterResources] = useState<Resource[]>([]);
    const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
    const [page, setPage] = useState(1);
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

    const handleTabClick = async (tabName: string) => {
        setActiveTab(tabName);
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_TAB + ": " + tabName);
        if (activeTab != tabName) {
            setPage(1);
            setSelectedChapter(null)
        }

        try {
            const actualTabName = tabName.toLowerCase();
            const curriculumName =
                selectedCourse === COURSES.JEE ? CURRICULUM_NAMES.ALC :
                    (selectedCourse === COURSES.NEET && tabName === 'Biology') ? CURRICULUM_NAMES.SANKALP :
                        (selectedCourse === COURSES.NEET && (tabName === 'Physics' || tabName === 'Chemistry')) ? CURRICULUM_NAMES.ALC :
                            CURRICULUM_NAMES.SANKALP;
            const curriculumData = await getCurriculum(curriculumName);
            const curriculumId = curriculumData[0].id;
            const subjectData = await getSubjects(actualTabName);
            const gradeData = await getGrades(selectedGrade);
            if (subjectData.length > 0) {
                const subjectId = subjectData[0].id;
                const gradeId = gradeData[0].id;

                await fetchChapters(subjectId, gradeId, curriculumId);
                const chapterData = selectedChapter
                    ? await getChapters(subjectId, gradeId, selectedChapter, curriculumId)
                    : await getChapters(subjectId, gradeId, undefined, curriculumId);

                if (chapterData.length > 0) {
                    setChapters(chapterData);
                }
                else {
                    setPage(page - 1);
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
    }, [selectedGrade, page, selectedChapter]);


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

    const fetchChapters = async (subjectId: number, gradeId: number, curriculumId: number) => {
        const chapterData = await getChapters(subjectId, gradeId, undefined, curriculumId);
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
                        <h1 className="font-semibold ml-2 text-xl lg:text-2xl">{selectedCourse === 'NEET Content' ? "NEET Course" : "JEE Course"}<br /></h1>
                    </div>
                    <span className="text-sm lg:text-base ml-[52px] lg:ml-10 font-normal lg:text-gray-600">Content Library</span>
                </div>
                <div className="flex flex-row mt-4 mb-4 justify-between lg:justify-center lg:gap-4 mx-6 lg:mx-0">
                    {selectedCourse === COURSES.NEET && neetSubjects.map(subject => generateSubjectButton(subject, subject))}
                    {selectedCourse === COURSES.JEE && jeeSubjects.map(subject => generateSubjectButton(subject, subject))}
                </div>
                <div className="bg-heading lg:bg-gray-50 lg:rounded-lg h-20 lg:h-16 flex justify-between lg:justify-center lg:gap-8 items-center px-4 lg:px-6 lg:mb-6">
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
                {isLoading ? (
                    <Loading showLibraryOnly={true} />
                ) : (
                    <div className="mt-4 pb-40 lg:pb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 lg:gap-6">
                            {chapters.map((chapter) => (
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
                                        <div className="lg:bg-gray-50 lg:p-6 lg:rounded-lg lg:ml-0">
                                            {expandedChapterLoading[chapter.id] ? (
                                                <Loading showChapterContentOnly={true} />
                                            ) : (
                                                <div className="lg:grid lg:grid-cols-1 xl:grid-cols-2 lg:gap-6">{/* Changed from ul to div */}
                                                {/* Render resources for the chapter. Currently using hardcoded tag_ids:
    1 = JEE resources, 2 = NEET resources */}
                                                {chapterResources
                                                    .filter((resource) =>
                                                        resource.type_params?.resource_type === "module" &&
                                                        resource.tag_ids?.includes(selectedCourse === 'JEE Content' ? 1 : 2)
                                                    )
                                                    .map((resource) => (
                                                        <div key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2 text-primary">
                                                            <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center hover:bg-white lg:hover:bg-gray-100 p-2 lg:p-3 rounded-lg transition-colors duration-200">
                                                                <Image src={ModuleIcon} alt="Module" className="w-8 h-8 lg:w-10 lg:h-10 mr-2 ml-9 lg:ml-0" /> 
                                                                <span className="lg:text-base">{resource.name}</span>
                                                            </Link>
                                                        </div>
                                                    ))}

                                                {topics
                                                    .filter((topic) => topic.chapter_id === chapter.id)
                                                    .map((topic) => {
                                                        const videos = resources.filter(
                                                            (resource) => resource.topic_id === topic.id &&
                                                                resource.link &&
                                                                resource.type_params?.resource_type !== "module"
                                                        );

                                                        return (
                                                            <div key={topic.id} className="bg-card rounded-lg shadow-lg lg:shadow-md shadow-slate-400 lg:shadow-gray-300 p-4 lg:p-6 mx-2 lg:mx-0 mt-2 my-8 lg:my-4 text-black font-semibold hover:shadow-xl transition-shadow duration-200">
                                                                <h3 className="lg:text-lg lg:mb-4">{topic.name}</h3>
                                                                <div className="text-primary m-2 lg:m-0 font-normal space-y-2 lg:space-y-3">
                                                                    {videos.map((resource) => (
                                                                        <div key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2 lg:py-0">
                                                                            <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center hover:bg-gray-50 p-2 lg:p-3 rounded-lg transition-colors duration-200">
                                                                                <Image src={PlayIcon} alt="Play" className="w-10 h-10 lg:w-12 lg:h-12 mr-2 lg:mr-3" /> 
                                                                                <span className="lg:text-base">{resource.name}</span>
                                                                            </Link>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <BottomNavigationBar />
                    </div>
                )}
            </main>
        </>
    );
};

export default ContentLibrary;
