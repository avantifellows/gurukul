"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getCurriculum, getSubjects, getChapters, getResourcesWithSource, getTopics, getGrades, getResourcesOfChapter, getChapterResourcesComplete } from '../../../api/afdb/library';
import { Chapter, Resource, Topic } from '../../types';
import { useEffect } from 'react';
import Link from 'next/link';
import ExpandIcon from "../../../assets/expand.png";
import CollapseIcon from "../../../assets/collapse.png";
import PlayIcon from "../../../assets/play.png";
import BackIcon from "../../../assets/icon.png";
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
            className={activeTab === subject ? 'bg-heading text-primary' : 'bg-white text-slate-600'}
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
                        <Image src={BackIcon} onClick={handleBackClick} alt="Play" className="w-5 h-5" />
                        <h1 className="font-semibold ml-4 text-xl pt-1">{selectedCourse === 'NEET Content' ? "NEET Course" : "JEE Course"}<br /></h1>
                    </div>
                    <span className="text-sm ml-[52px] font-normal">Content Library</span>
                </div>
                <div className="flex flex-row mt-4 mb-4 justify-between mx-6">
                    {selectedCourse === 'NEET Content' && neetSubjects.map(subject => generateSubjectButton(subject, subject))}
                    {selectedCourse === 'JEE Content' && jeeSubjects.map(subject => generateSubjectButton(subject, subject))}
                </div>
                <div className="bg-heading h-20 flex justify-between items-center px-4">
                    <select
                        onChange={(e) => handleGradeChange(+e.target.value)}
                        value={selectedGrade}
                        className="w-32 h-8 rounded-lg text-center"
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
                        className="w-32 h-8 rounded-lg text-center"
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
                    <div className="mt-4 pb-40">
                        {chapters.map((chapter) => (
                            <div key={chapter.id} className="mx-5">
                                <div
                                    className="text-md font-semibold mt-2 bg-primary text-white cursor-pointer px-4 py-4 mb-4 flex flex-row justify-between items-center"
                                    onClick={() => toggleChapterExpansion(chapter.id, chapter.name)}
                                >
                                    <div className="w-52">{chapter.name}</div>
                                    <div className="w-8 flex justify-center">
                                        {expandedChapters[chapter.id] ? (
                                            <Image src={CollapseIcon} alt="Collapse" />
                                        ) : (
                                            <Image src={ExpandIcon} alt="Expand" />
                                        )}
                                    </div>
                                </div>
                                {expandedChapters[chapter.id] && (
                                    <div>
                                        {expandedChapterLoading[chapter.id] ? (
                                            <Loading showChapterContentOnly={true} />
                                        ) : (
                                            <ul>
                                                {/* Render modules for the chapter */}
                                                {chapterResources
                                                    .filter((resource) => resource.type_params?.resource_type === "module")
                                                    .map((resource) => (
                                                        <li key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2">
                                                            <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center">
                                                                <Image src={ModuleIcon} alt="Module" className="w-10 h-10 mr-2" /> {resource.name}
                                                            </Link>
                                                        </li>
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
                                                            <div key={topic.id} className="bg-card rounded-lg shadow-lg shadow-slate-400 p-4 mx-2 mt-2 my-8 text-black font-semibold">
                                                                <h3>{topic.name}</h3>
                                                                <ul className="text-primary m-2 font-normal">
                                                                    {videos.map((resource) => (
                                                                        <li key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2">
                                                                            <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center">
                                                                                <Image src={PlayIcon} alt="Play" className="w-10 h-10 mr-2" /> {resource.name}
                                                                            </Link>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        );
                                                    })}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        <BottomNavigationBar />
                    </div>
                )}
            </main>
        </>
    );
};

export default ContentLibrary;
