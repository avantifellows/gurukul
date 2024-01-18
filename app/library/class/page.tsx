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
import BackIcon from "../../../assets/icon.png";
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

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
    const selectedCourse = searchParams.get('course');
    const neetSubjects = ['Physics', 'Chemistry', 'Biology'];
    const jeeSubjects = ['Physics', 'Chemistry', 'Maths'];

    const handleTabClick = async (tabName: string) => {
        setActiveTab(tabName);
        if (activeTab != tabName) {
            setSelectedChapter(null)
        }

        try {
            const actualTabName = tabName.toLowerCase();
            const subjectData = await getSubjects(actualTabName);
            const gradeData = await getGrades(selectedGrade);
            const teacherData = await getTeachers(undefined, actualTabName);
            setTeachers(teacherData);
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

    const handleTeacherChange = (selectedTeacherId: number) => {
        setSelectedTeacher(selectedTeacherId);
    };

    const handleChapterClick = async (chapterId: number) => {
        try {
            const resourceData = await getResourcesOfChapter(chapterId, selectedTeacher);
            setResources(resourceData);
        } catch (error) {
            console.error('Error fetching chapter data:', error);
        }
    };

    const toggleChapterExpansion = async (chapterId: number) => {
        setExpandedChapters((prevExpanded) => ({
            ...prevExpanded,
            [chapterId]: !prevExpanded[chapterId],
        }));

        if (!expandedChapters[chapterId]) {
            await handleChapterClick(chapterId);
        }
    };

    const handleBackClick = () => {
        router.push('/library');
    };

    const handleGradeChange = (grade: number) => {
        setSelectedGrade(grade);
        setSelectedChapter(null)
    };

    const fetchChapters = async (subjectId: number, gradeId: number) => {
        const chapterData = await getClassChapters(subjectId, gradeId, undefined, selectedTeacher);
        setChapterList(chapterData);
    };

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
                        <h1 className="font-semibold ml-4 text-xl pt-1">{selectedCourse === 'NEET Classes' ? "NEET Classes" : "JEE Classes"}<br /></h1>
                    </div>
                    <span className="text-sm ml-[52px] font-normal">Class Library</span>
                </div>
                <div className="flex flex-row my-4 justify-between mx-6">
                    {selectedCourse === 'NEET Classes' && neetSubjects.map(subject => generateSubjectButton(subject, subject))}
                    {selectedCourse === 'JEE Classes' && jeeSubjects.map(subject => generateSubjectButton(subject, subject))}
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
                <div className="bg-heading pb-6 flex justify-between items-center px-4">
                    <select
                        onChange={(e) => handleTeacherChange(+e.target.value)}
                        value={selectedTeacher}
                        className="w-32 h-8 rounded-lg text-center"
                    >
                        <option value="" className="text-sm md:text-lg">Teacher: All</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id} className="text-sm md:text-lg">
                                {teacher.user.first_name}
                            </option>
                        ))}
                    </select>
                </div>
                {isLoading ? (
                    <Loading />
                ) : (
                    <div className="mt-4 pb-40">
                        {chapters.length > 0 ? (chapters.map((chapter) => (
                            <div key={chapter.id} className="mx-5">
                                <div
                                    className="text-md font-semibold mt-2 bg-primary text-white cursor-pointer px-4 py-4 mb-4 flex flex-row justify-between items-center"
                                    onClick={() => toggleChapterExpansion(chapter.id)}
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
                                    <ul className="text-primary m-2 font-normal">
                                        {resources
                                            .filter((resource) => resource.chapter_id === chapter.id)
                                            .map((resource) => (
                                                <li key={resource.id} className="py-2">
                                                    <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row">
                                                        <Image src={PlayIcon} alt="Play" className="w-10 h-10 mr-2" /> {resource.name}
                                                    </Link>
                                                </li>
                                            ))}
                                    </ul>
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
