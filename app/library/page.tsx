"use client"

import React, { useState } from 'react';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getSubjects, getChapters, getResources } from './contentList';
import { Subject, Chapter, Resource } from '../types';
import { useEffect } from 'react';

const Page = () => {
  const [activeTab, setActiveTab] = useState('Physics');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});

  const handleTabClick = async (tabName: string) => {
    setActiveTab(tabName);
    try {
      const actualTabName = tabName.toLowerCase();
      const subjectData = await getSubjects(actualTabName);
      if (subjectData.length > 0) {
        const subjectId = subjectData[0].id;
        setSubjects(subjectData);
        const chapterData = await getChapters(subjectId);
        setChapters(chapterData);
        const chapterIds = chapterData.map((chapter) => chapter.id);
        const resourceData = await getResources(chapterIds);
        setResources(resourceData);
      } else {
        // Handle the case when no subjects are found
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Handle the error and display an error message to the user
    }
  };

  useEffect(() => {
    handleTabClick('Physics');
  }, []);

  const toggleChapterExpansion = (chapterId: number) => {
    setExpandedChapters((prevExpanded) => ({
      ...prevExpanded,
      [chapterId]: !prevExpanded[chapterId],
    }));
  };

  return (
    <>
      <TopBar />
      <div className="bg-heading text-primary h-20 flex flex-col">
        <h1 className="font-semibold ml-4 text-xl pt-6">NEET Course <br /></h1>
        <span className="text-xs ml-4 font-normal">New Delhi</span>
      </div>
      <div className="flex flex-row justify-between px-5 mt-4">
      <div className="flex flex-row justify-between px-5 mt-4 mb-4">
        <PrimaryButton
          onClick={() => handleTabClick('Physics')}
          className={activeTab === 'Physics' ? 'bg-heading text-primary' : 'bg-white text-slate-600 w-20'}
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
      </div>
      </div>
      <BottomNavigationBar />
      {resources.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 pb-40ax">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="p-4 border bg-primary shadow-lg mx-4 mt-1 text-white">
              <h2 className="text-md font-semibold mt-2" onClick={() => toggleChapterExpansion(chapter.id)}>
                {chapter.name}
                {expandedChapters[chapter.id] ? ' \u25BC' : ' \u25B2'}
              </h2>
              {expandedChapters[chapter.id] && (
                <ul>
                  {resources
                    .filter((resource) => resource.chapter_id === chapter.id)
                    .map((resource) => (
                      <li key={resource.id}>{resource.name}</li>
                    ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
};

export default Page;
