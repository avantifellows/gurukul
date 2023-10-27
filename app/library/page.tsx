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
import Image from 'next/image';

const Page = () => {
  const [activeTab, setActiveTab] = useState('Physics');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]); // New state for topics
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(1); // Initialize the page number to 1
  const [selectedGrade, setSelectedGrade] = useState(9); // Initialize to Grade 9

  const handleTabClick = async (tabName: string) => {
    setActiveTab(tabName);
    if (activeTab != tabName) {
      setPage(1);
    }
    console.log(page, "page")
    try {
      const actualTabName = tabName.toLowerCase();
      const subjectData = await getSubjects(actualTabName);
      const gradeData = await getGrades(selectedGrade);
      if (subjectData.length > 0) {
        const subjectId = subjectData[0].id;
        const gradeId = gradeData[0].id;
        const offset = (page - 1) * 4;
        const chapterData = await getChapters(subjectId, gradeId, 4, offset);
        setChapters(chapterData);
        const chapterIds = chapterData.map((chapter) => chapter.id);
        const topicData = await getTopics(chapterIds, 4, 0);
        setTopics(topicData);
        const topicIds = topicData.map((topic) => topic.id);
        const resourceData = await getResourcesWithSource(topicIds);
        setResources(resourceData);

      } else {
        console.log("Bad request")
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    handleTabClick(activeTab); // Pass selectedGrade
  }, [selectedGrade, page]);

  const toggleChapterExpansion = (chapterId: number) => {
    setExpandedChapters((prevExpanded) => ({
      ...prevExpanded,
      [chapterId]: !prevExpanded[chapterId],
    }));
  };

  const handleNextPage = () => {
    const nextPage = page + 1; // Increment the page number
    setPage(nextPage); // Update the page state
    handleTabClick(activeTab); // Call the API with the updated page
  };

  const handleGradeChange = (grade: number) => {
    setSelectedGrade(grade);
  };

  return (
    <>
      <TopBar />
      <div className="bg-heading text-primary h-20 flex flex-col">
        <h1 className="font-semibold ml-4 text-xl pt-6">NEET Course <br /></h1>
        <span className="text-xs ml-4 font-normal">New Delhi</span>
      </div>
      <div className="flex flex-row mt-4 mb-4">
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
      <div className="bg-heading h-20 flex justify-start items-center px-8">
        <select onChange={(e) => handleGradeChange(+e.target.value)} className="w-28 h-8 rounded-lg text-center">
          <option value={9} className="text-xs">Grade 9</option>
          <option value={10} className="text-xs">Grade 10</option>
          <option value={11} className="text-xs">Grade 11</option>
          <option value={12} className="text-xs">Grade 12</option>
        </select>
      </div>
      {resources.length > 0 ? (
        <div className="mt-4 mb-40">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="mx-5">
              <div
                className="text-md font-semibold mt-2 bg-primary text-white cursor-pointer px-4 py-4 mb-4 flex flex-row justify-between items-center"
                onClick={() => toggleChapterExpansion(chapter.id)}
              >
                <div className="w-52">{chapter.name}</div>
                <div className="w-8 flex justify-center">
                  {expandedChapters[chapter.id] ? (
                    <Image src={ExpandIcon} alt="Expand" />
                  ) : (
                    <Image src={CollapseIcon} alt="Collapse" />
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
                                <Link href={resource.link} target="_blank" rel="noopener noreferrer">
                                  {resource.name}
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
          <div className="flex justify-center rounded-lg mt-8">
            <PrimaryButton onClick={handleNextPage} className="bg-heading text-primary">Next Page</PrimaryButton>
          </div>
          <BottomNavigationBar />
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Page;
