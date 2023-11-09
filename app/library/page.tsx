"use client"

import React, { useState } from 'react';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getSubjects, getChapters, getResourcesWithSource, getTopics, getGrades } from './contentList';
import { Chapter, Resource, Topic } from '../types';
import { useEffect } from 'react';
import Link from 'next/link';
import ExpandIcon from "../../assets/expand.png";
import CollapseIcon from "../../assets/collapse.png";
import PlayIcon from "../../assets/play.png"
import Image from 'next/image';

const Page = () => {
  const [activeTab, setActiveTab] = useState('Physics');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState(9);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterList, setChapterList] = useState<Chapter[]>([]);
  const limit = 4;
  const gradeOptions = [9, 10, 11, 12];

  const handleTabClick = async (tabName: string) => {
    setActiveTab(tabName);
    if (activeTab != tabName) {
      setPage(1);
      setSelectedChapter(null)
    }

    try {
      const actualTabName = tabName.toLowerCase();
      const subjectData = await getSubjects(actualTabName);
      const gradeData = await getGrades(selectedGrade);
      if (subjectData.length > 0) {
        const subjectId = subjectData[0].id;
        const gradeId = gradeData[0].id;
        const offset = (page - 1) * limit;

        const finalOffset = offset >= 0 ? offset : 0;
        await fetchChapters(subjectId, gradeId);
        const chapterData = selectedChapter
          ? await getChapters(subjectId, gradeId, limit, finalOffset, selectedChapter)
          : await getChapters(subjectId, gradeId, limit, finalOffset);

        if (chapterData.length > 0) {
          setChapters(chapterData);
          const chapterIds = chapterData.map((chapter) => chapter.id);
          const topicData = await getTopics(chapterIds, limit, 0);
          setTopics(topicData);
          const topicIds = topicData.map((topic) => topic.id);
          const resourceData = await getResourcesWithSource(topicIds);
          setResources(resourceData);
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
    handleTabClick(activeTab);
  }, [selectedGrade, page, selectedChapter]);

  const toggleChapterExpansion = (chapterId: number) => {
    setExpandedChapters((prevExpanded) => ({
      ...prevExpanded,
      [chapterId]: !prevExpanded[chapterId],
    }));
  };

  const handleNextPage = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    handleTabClick(activeTab);
  };

  const handlePreviousPage = () => {
    const previousPage = page - 1;
    if (previousPage >= 1) {
      setPage(previousPage);
      handleTabClick(activeTab);
    }
  };

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
    setSelectedChapter(null)
  };

  const fetchChapters = async (subjectId: number, gradeId: number) => {
    const chapterData = await getChapters(subjectId, gradeId);
    setChapterList(chapterData);
  };

  return (
    <main className="max-w-xl mx-auto bg-white min-h-screen">
      <TopBar />
      <div className="bg-heading text-primary h-20 flex flex-col">
        <h1 className="font-semibold ml-4 text-xl pt-6">NEET Course <br /></h1>
        <span className="text-xs ml-4 font-normal">New Delhi</span>
      </div>
      <div className="flex flex-row mt-4 mb-4 justify-between md:mx-4 mx-1">
        <PrimaryButton
          onClick={() => handleTabClick('Physics')}
          className={activeTab === 'Physics' ? 'bg-heading text-primary' : 'bg-white text-slate-600'}
        >
          Physics
        </PrimaryButton>
        <PrimaryButton
          onClick={() => handleTabClick('Chemistry')}
          className={activeTab === 'Chemistry' ? 'bg-heading text-primary' : 'bg-white text-slate-600'}
        >
          Chemistry
        </PrimaryButton>
        <PrimaryButton
          onClick={() => handleTabClick('Maths')}
          className={activeTab === 'Maths' ? 'bg-heading text-primary' : 'bg-white text-slate-600'}
        >
          Maths
        </PrimaryButton>
        <PrimaryButton
          onClick={() => handleTabClick('Biology')}
          className={activeTab === 'Biology' ? 'bg-heading text-primary' : 'bg-white text-slate-600'}
        >
          Biology
        </PrimaryButton>
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
      {resources.length > 0 ? (
        <div className="mt-4 pb-40">
          {chapters.map((chapter) => (
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
                <ul>
                  {topics
                    .filter((topic) => topic.chapter_id === chapter.id)
                    .map((topic) => (
                      <div key={topic.id} className="bg-card rounded-lg shadow-lg shadow-slate-400 p-4 mx-2 mt-2 my-8 text-black font-semibold">
                        <h3>{topic.name}</h3>
                        <ul className="text-primary m-2 font-normal">
                          {resources
                            .filter((resource) => resource.topic_id === topic.id)
                            .map((resource) => (
                              <li key={resource.id} className="py-2">
                                <Link href={resource.link} target="_blank" rel="noopener noreferrer" className="flex flex-row">
                                  <Image src={PlayIcon} alt="Play" className="w-10 h-10 mr-2" /> {resource.name}
                                </Link>
                              </li>
                            ))}
                        </ul>
                      </div>
                    ))}
                </ul>
              )}
            </div>
          ))}
          <div className="flex justify-between rounded-lg mt-8 px-4">
            <PrimaryButton onClick={handlePreviousPage} className="bg-heading text-primary">Previous</PrimaryButton>
            <PrimaryButton onClick={handleNextPage} className="bg-heading text-primary">Next</PrimaryButton>
          </div>
          <BottomNavigationBar />
        </div>
      ) : (
        <Loading />
      )}
    </main>
  );
};

export default Page;
