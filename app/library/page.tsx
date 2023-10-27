"use client"

import React, { useState } from 'react';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Loading from '../loading';
import TopBar from '@/components/TopBar';
import PrimaryButton from '@/components/Button';
import { getSubjects, getChapters, getResources, getTopics } from './contentList';
import { Subject, Chapter, Resource, Topic } from '../types';
import { useEffect } from 'react';

const Page = () => {
  const [activeTab, setActiveTab] = useState('Physics');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]); // New state for topics
  const [resources, setResources] = useState<Resource[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({});

  const handleTabClick = async (tabName: string) => {
    setActiveTab(tabName);
    try {
      const actualTabName = tabName.toLowerCase();
      const subjectData = await getSubjects(actualTabName);
      if (subjectData.length > 0) {
        const subjectId = subjectData[0].id;
        const chapterData = await getChapters(subjectId, 5, 0);
        setChapters(chapterData);
        const chapterIds = chapterData.map((chapter) => chapter.id);
        const topicData = await getTopics(chapterIds, 5, 0);
        setTopics(topicData);
        const topicIds = topicData.map((topic) => topic.id);
        const resourceData = await getResources(topicIds);
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
        <div className="mt-4 mb-40">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="mx-5">
              <h2 className="text-md font-semibold mt-2 bg-primary text-white cursor-pointer px-4 py-4 mb-4" onClick={() => toggleChapterExpansion(chapter.id)}>
                {chapter.name}
                {expandedChapters[chapter.id] ? ' \u25BC' : ' \u25B2'}
              </h2>
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
                              <li key={resource.id} className="py-2">{resource.name}</li>
                            ))}
                        </ul>
                      </div>
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
