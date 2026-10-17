"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/Button';
import TopBar from '@/components/TopBar';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Image from 'next/image';
import StethoscopeIcon from '../../assets/stethoscope.png';
import BlueprintIcon from '../../assets/blueprint.png';
import NDAIcon from '../../assets/military_man.png';
import CUETLogo from '../../assets/cuet_logo.png'
import { MdSchool } from 'react-icons/md';
import { GiScales } from 'react-icons/gi';
import { FaRupeeSign } from 'react-icons/fa';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';
import { useAuth } from '@/services/AuthContext';
import { ReactNode } from 'react';

const Page: React.FC = () => {
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>('Content');
  const { push } = useRouter();
  const { groupConfig } = useAuth();

  const handleLibraryChange = (library: string) => {
    MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_LIBRARY, { library_name: library });

    if (
      library === 'NEET Content' ||
      library === 'JEE Content' ||
      library === 'JEE Advance Content' ||
      library === 'CLAT Content' ||
      library === 'CA Content' ||
      library === 'Grade 9 Foundation' ||
      library === 'Grade 10 Foundation' ||
      library === 'CUET' ||
      library === 'NDA'
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

  const buttonStyle = 'mx-4 w-48 md:w-72 whitespace-nowrap lg:mx-0 lg:w-auto lg:px-6';
  const selectedButtonStyle = 'bg-white text-primary font-semibold py-2 rounded-lg shadow-sm lg:border lg:border-primary';
  const unselectedButtonStyle = 'bg-heading text-slate-600 py-2 rounded-lg lg:bg-white lg:border lg:border-line lg:hover:border-slate-400 lg:transition-colors';

  function LibraryCard({ icon, title, description, onClick }: { icon: ReactNode, title: string, description: string, onClick: () => void }) {
    return (
      <button type="button" onClick={onClick} className="w-full text-left bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6 cursor-pointer lg:mx-0 lg:my-0 lg:mt-0 lg:h-auto lg:py-5 lg:pl-5 lg:pr-6 lg:rounded-xl lg:bg-white lg:border lg:border-line lg:shadow-none lg:hover:border-primary lg:transition-colors">
        <div className="flex flex-row items-center">
          {icon}
          <div className="flex flex-col ml-4 ">
            <h3 className="font-semibold">{title}</h3>
            <h5 className="text-sm lg:text-slate-500">{description}</h5>
          </div>
        </div>
      </button>
    );
  }

  const contentCourses = [
    {
      value: 'JEE Content',
      title: 'JEE Mains course',
      description: 'Browse all the JEE courses',
      icon: <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10" />,
    },
    {
      value: 'NEET Content',
      title: 'NEET course',
      description: 'Browse all the NEET courses',
      icon: <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10" />,
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
    {
      value: 'CUET',
      title: 'CUET course',
      description: 'Browse all the CUET courses',
      icon: <Image src={CUETLogo} alt="CUET Icon" className="w-10 h-10 mix-blend-multiply" />,
    },
    {
      value: 'NDA',
      title: 'NDA course',
      description: 'Browse all the NDA courses',
      icon: <Image src={NDAIcon} alt="NDA Icon" className="w-10 h-10" />,
    },
    {
      value: 'Grade 10 Foundation',
      title: 'Grade 10 Foundation',
      description: 'Browse all the Grade 10 courses',
      icon: <MdSchool className="w-10 h-10 text-indigo-700" />,
    },
    {
      value: 'Grade 9 Foundation',
      title: 'Grade 9 Foundation',
      description: 'Browse all the Grade 9 courses',
      icon: <MdSchool className="w-10 h-10 text-purple-700" />,
    }
  ];

  const classCourses = [
    {
      value: 'JEE Classes',
      title: 'JEE Mains classes',
      description: 'Browse all the JEE classes',
      icon: <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10" />,
    },
    {
      value: 'NEET Classes',
      title: 'NEET classes',
      description: 'Browse all the NEET classes',
      icon: <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10" />,
    },
  ];

  return (
    <main className="max-w-xl mx-auto bg-heading min-h-screen lg:max-w-none lg:bg-transparent">
      <TopBar />
      <div className="lg:mx-auto lg:max-w-6xl lg:px-10 lg:pt-8 lg:pb-16">

      {selectedLibrary !== 'NEET Content' && selectedLibrary !== 'JEE Content' && selectedLibrary !== 'Grade 9 Foundation' && selectedLibrary !== 'Grade 10 Foundation' && selectedLibrary !== 'CUET' && selectedLibrary !== 'NDA' && (
        <div className="flex flex-row mt-4 mb-4 justify-between md:mx-4 mx-1 lg:mx-0 lg:mt-0 lg:mb-8 lg:justify-start lg:gap-3">
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
        <div className="bg-white pb-40 pt-4 lg:bg-transparent lg:pb-0 lg:pt-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
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
        <div className="bg-white pb-40 pt-4 lg:bg-transparent lg:pb-0 lg:pt-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4">
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
      </div>
    </main>
  );
};

export default Page;
