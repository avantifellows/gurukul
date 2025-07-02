"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/Button';
import TopBar from '@/components/TopBar';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Image from 'next/image';
import StethoscopeIcon from '../../assets/stethoscope.png';
import BlueprintIcon from '../../assets/blueprint.png';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';
import { useAuth } from '@/services/AuthContext';
import { getGroupConfig } from '@/config/groupConfig';

const Page: React.FC = () => {
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>('Content');
  const { push } = useRouter();
  const { group } = useAuth();
  const groupConfig = getGroupConfig(group || 'defaultGroup');

  const handleLibraryChange = (library: string) => {
    setSelectedLibrary(library);
    MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_LIBRARY + ": " + library);
  };

  useEffect(() => {
    if (selectedLibrary === 'NEET Content' || selectedLibrary === 'JEE Content') {
      push(`/library/content?course=${selectedLibrary}`);
    }
    if (selectedLibrary === 'NEET Classes' || selectedLibrary === 'JEE Classes') {
      push(`/library/class?course=${selectedLibrary}`);
    }
  }, [selectedLibrary, push]);

  const buttonStyle = 'mx-4 w-48 md:w-72 whitespace-nowrap';
  const selectedButtonStyle = 'bg-white text-primary font-semibold py-2 rounded-lg shadow-sm';
  const unselectedButtonStyle = 'bg-heading text-slate-600 py-2 rounded-lg';

  return (
    <main className="max-w-xl mx-auto lg:max-w-none lg:mx-0 lg:p-6 bg-heading lg:bg-transparent min-h-screen">
      <TopBar />

      {selectedLibrary !== 'NEET Content' && selectedLibrary !== 'JEE Content' && (
        <div className="flex flex-row mt-4 mb-4 justify-between md:mx-4 mx-1 lg:justify-center lg:gap-6">
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
        <div className="bg-white lg:bg-transparent h-72 lg:h-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 lg:mt-8">
            <div onClick={() => handleLibraryChange('NEET Content')} className="pt-4 lg:pt-0">
              <div className="bg-card rounded-md shadow-lg shadow-slate-400 lg:shadow-md h-24 lg:h-32 mt-2 my-10 lg:my-0 text-black flex items-center justify-start pl-4 mx-6 lg:mx-0 cursor-pointer hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center">
                  <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10 lg:w-12 lg:h-12" />
                  <div className="flex flex-col ml-4">
                    <h3 className="font-semibold lg:text-lg">NEET course</h3>
                    <h5 className="text-sm lg:text-base text-gray-600">Browse all the NEET courses</h5>
                  </div>
                </div>
              </div>
            </div>
            <div onClick={() => handleLibraryChange('JEE Content')}>
              <div className="bg-card rounded-md shadow-lg shadow-slate-400 lg:shadow-md h-24 lg:h-32 mt-2 my-10 lg:my-0 text-black flex items-center justify-start pl-4 mx-6 lg:mx-0 cursor-pointer hover:shadow-xl transition-shadow duration-200">
                <div className="flex flex-row items-center">
                  <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10 lg:w-12 lg:h-12" />
                  <div className="flex flex-col ml-4">
                    <h3 className="font-semibold lg:text-lg">JEE Mains course</h3>
                    <h5 className="text-sm lg:text-base text-gray-600">Browse all the JEE courses</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <BottomNavigationBar />
        </div>
      )}

      {selectedLibrary === 'Class' && (
        <div className="bg-white lg:bg-transparent h-72 lg:h-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 lg:mt-8">
            <div onClick={() => handleLibraryChange('NEET Classes')} className="pt-4 lg:pt-0">
              <div className="bg-card rounded-md shadow-lg shadow-slate-400 lg:shadow-md h-24 lg:h-32 mt-2 my-10 lg:my-0 text-black flex items-center justify-start pl-4 mx-6 lg:mx-0 cursor-pointer hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center">
                  <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10 lg:w-12 lg:h-12" />
                  <div className="flex flex-col ml-4">
                    <h3 className="font-semibold lg:text-lg">NEET classes</h3>
                    <h5 className="text-sm lg:text-base text-gray-600">Browse all the NEET classes</h5>
                  </div>
                </div>
              </div>
            </div>
            <div onClick={() => handleLibraryChange('JEE Classes')}>
              <div className="bg-card rounded-md shadow-lg shadow-slate-400 lg:shadow-md h-24 lg:h-32 mt-2 my-10 lg:my-0 text-black flex items-center justify-start pl-4 mx-6 lg:mx-0 cursor-pointer hover:shadow-xl transition-shadow duration-200">
                <div className="flex flex-row items-center">
                  <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10 lg:w-12 lg:h-12" />
                  <div className="flex flex-col ml-4">
                    <h3 className="font-semibold lg:text-lg">JEE Mains classes</h3>
                    <h5 className="text-sm lg:text-base text-gray-600">Browse all the JEE classes</h5>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <BottomNavigationBar />
        </div>
      )}
    </main>
  );
};

export default Page;
