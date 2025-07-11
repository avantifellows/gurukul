"use client"

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getCurriculum, getSubjects, getChapters, getGrades, getChapterResourcesComplete } from '../../../api/afdb/library';
import { Chapter, Resource, Topic } from '../../types';
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
            const actualTabName = tabName.toLowerCase();
            let curriculumId: number | undefined = undefined;
            if (selectedCourse === COURSES.JEE || selectedCourse === COURSES.NEET) {
                const curriculumName =
                    selectedCourse === COURSES.JEE ? CURRICULUM_NAMES.ALC :
                        (selectedCourse === COURSES.NEET && tabName === 'Biology') ? CURRICULUM_NAMES.SANKALP :
                            (selectedCourse === COURSES.NEET && (tabName === 'Physics' || tabName === 'Chemistry')) ? CURRICULUM_NAMES.ALC :
                                CURRICULUM_NAMES.SANKALP;
                const curriculumData = await getCurriculum(curriculumName);
                curriculumId = curriculumData[0].id;
            }
            const subjectData = await getSubjects(actualTabName);
            const gradeData = await getGrades(selectedGrade);
            if (subjectData.length > 0) {
                const subjectId = subjectData[0].id;
                const gradeId = gradeData[0].id;
                if (!curriculumId) {
                    await fetchChapters(subjectId, gradeId, curriculumId);
                } else {
                    await fetchChapters(subjectId, gradeId);
                }
                const chapterData = selectedChapter
                    ? (!curriculumId
                        ? await getChapters(subjectId, gradeId, selectedChapter)
                        : await getChapters(subjectId, gradeId, selectedChapter, curriculumId))
                    : (!curriculumId
                        ? await getChapters(subjectId, gradeId)
                        : await getChapters(subjectId, gradeId, undefined, curriculumId));

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

    // Set default subject based on course ONLY when course actually changes
    useEffect(() => {
        if (prevCourseRef.current !== selectedCourse) {
            if (selectedCourse === COURSES.JEE || selectedCourse === COURSES.NEET) {
                setActiveTab('Physics');
            } else if (selectedCourse === COURSES.CA) {
                setActiveTab('Accounting');
            } else if (selectedCourse === COURSES.CLAT) {
                setActiveTab('English');
            }
            prevCourseRef.current = selectedCourse;
        }
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

    const fetchChapters = async (subjectId: number, gradeId: number, curriculumId?: number) => {
        let chapterData;
        if (!curriculumId) {
            chapterData = await getChapters(subjectId, gradeId);
        } else {
            chapterData = await getChapters(subjectId, gradeId, undefined, curriculumId);
        }
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
                <div className="grid grid-cols-3 gap-2 mt-4 mb-4 mx-6">
                    {selectedCourse === COURSES.NEET && neetSubjects.map(subject => generateSubjectButton(subject, subject))}
                    {selectedCourse === COURSES.JEE && jeeSubjects.map(subject => generateSubjectButton(subject, subject))}
                    {selectedCourse === COURSES.CA && caSubjects.map(subject => generateSubjectButton(subject, subject))}
                    {selectedCourse === COURSES.CLAT && clatSubjects.map(subject => generateSubjectButton(subject, subject))}
                </div>
                <div className="bg-heading h-20 flex justify-between items-center px-4">
                    <select
                        onChange={(e) => handleGradeChange(+e.target.value)}
                        value={selectedGrade}
                        className="w-32 h-8 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-32 h-8 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        {chapters.length === 0 ? (
                            <div className="text-center pt-10">No chapters available</div>
                        ) : (
                            chapters.map((chapter) => (
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
                                                        .filter((resource) =>
                                                            resource.type_params?.resource_type === "module"
                                                        )
                                                        .map((resource) => (
                                                            <li key={resource.id} onClick={() => handleResourceTracking(resource.name)} className="py-2 text-primary">
                                                                <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row items-center">
                                                                    <Image src={ModuleIcon} alt="Module" className="w-8 h-8 mr-2 ml-9" /> {resource.name}
                                                                </Link>
                                                            </li>
                                                        ))}

                                                    {/* Render topics and their resources */}
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

                                                    {/* If no modules and no topics/resources, show a message */}
                                                    {chapterResources.filter((resource) => resource.type_params?.resource_type === "module").length === 0 &&
                                                        topics.filter((topic) => topic.chapter_id === chapter.id).length === 0 && (
                                                            <li className="py-2 text-slate-500 ml-9">No resources available for this chapter.</li>
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
