"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/Button';
import TopBar from '@/components/TopBar';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Image from 'next/image';
import StethoscopeIcon from '../../assets/stethoscope.png';
import BlueprintIcon from '../../assets/blueprint.png';
import { MdScience } from 'react-icons/md';
import { GiScales } from 'react-icons/gi';
import { FaRupeeSign } from 'react-icons/fa';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';
import { useAuth } from '@/services/AuthContext';
import { getGroupConfig } from '@/config/groupConfig';
import { ReactNode } from 'react';

const Page: React.FC = () => {
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>('Content');
  const { push } = useRouter();
  const { group } = useAuth();
  const groupConfig = getGroupConfig(group || 'defaultGroup');

  const handleLibraryChange = (library: string) => {
    MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_LIBRARY + ": " + library);

    if (
      library === 'NEET Content' ||
      library === 'JEE Content' ||
      library === 'JEE Advance Content' ||
      library === 'CLAT Content' ||
      library === 'CA Content'
    ) {
      push(`/library/content?course=${library}`);
      return;
    }
    if (
      library === 'NEET Classes' ||
      library === 'JEE Classes'
    ) {
      push(`/library/class?course=${library}`);
      return;
    }

    setSelectedLibrary(library);
  };

  const buttonStyle = 'mx-4 w-48 md:w-72 whitespace-nowrap';
  const selectedButtonStyle = 'bg-white text-primary font-semibold py-2 rounded-lg shadow-sm';
  const unselectedButtonStyle = 'bg-heading text-slate-600 py-2 rounded-lg';

  function LibraryCard({ icon, title, description, onClick }: { icon: ReactNode, title: string, description: string, onClick: () => void }) {
    return (
      <div onClick={onClick} className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6 cursor-pointer">
        <div className="flex flex-row items-center">
          {icon}
          <div className="flex flex-col ml-4 ">
            <h3 className="font-semibold">{title}</h3>
            <h5 className="text-sm">{description}</h5>
          </div>
        </div>
      </div>
    );
  }

  const contentCourses = [
    {
      value: 'NEET Content',
      title: 'NEET course',
      description: 'Browse all the NEET courses',
      icon: <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10" />,
    },
    {
      value: 'JEE Content',
      title: 'JEE Mains course',
      description: 'Browse all the JEE courses',
      icon: <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10" />,
    },
    // Temporarily commenting out JEE Advanced Content until we get the data
    // {
    //   value: 'JEE Advanced Content',
    //   title: 'JEE Advanced course',
    //   description: 'Browse all the JEE Advance courses',
    //   icon: <MdScience className="w-10 h-10 text-blue-700" />,
    // },
    {
      value: 'CLAT Content',
      title: 'CLAT course',
      description: 'Browse all the CLAT courses',
      icon: <GiScales className="w-10 h-10 text-green-700" />,
    },
    {
      value: 'CA Content',
      title: 'CA course',
      description: 'Browse all the CA courses',
      icon: <FaRupeeSign className="w-10 h-10 text-yellow-700" />,
    },
  ];

  const classCourses = [
    {
      value: 'NEET Classes',
      title: 'NEET classes',
      description: 'Browse all the NEET classes',
      icon: <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10" />,
    },
    {
      value: 'JEE Classes',
      title: 'JEE Mains classes',
      description: 'Browse all the JEE classes',
      icon: <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10" />,
    },
  ];

  return (
    <main className="mx-auto bg-heading min-h-screen">
      <TopBar />

      {selectedLibrary !== 'NEET Content' && selectedLibrary !== 'JEE Content' && (
        <div className="flex flex-row mt-4 mb-4 justify-between md:mx-4 mx-1">
          <PrimaryButton
            onClick={() => handleLibraryChange('Content')}
            className={`${buttonStyle} ${selectedLibrary === 'Content' ? selectedButtonStyle : unselectedButtonStyle}`}
          >
            Content Library
          </PrimaryButton>
          {groupConfig.showClassLibrary && (
            <PrimaryButton
              onClick={() => handleLibraryChange('Class')}
              className={`${buttonStyle} ${selectedLibrary === 'Class' ? selectedButtonStyle : unselectedButtonStyle}`}
            >
              Class Library
            </PrimaryButton>
          )}
        </div>
      )}

      {selectedLibrary === 'Content' && (
        <div className="bg-white pb-40 pt-4">
          {contentCourses.map(course => (
            <LibraryCard
              key={course.value}
              icon={course.icon}
              title={course.title}
              description={course.description}
              onClick={() => handleLibraryChange(course.value)}
            />
          ))}
          <BottomNavigationBar />
        </div>
      )}

      {selectedLibrary === 'Class' && (
        <div className="bg-white pb-40 pt-4">
          {classCourses.map(course => (
            <LibraryCard
              key={course.value}
              icon={course.icon}
              title={course.title}
              description={course.description}
              onClick={() => handleLibraryChange(course.value)}
            />
          ))}
          <BottomNavigationBar />
        </div>
      )}
    </main>
  );
};

export default Page;
