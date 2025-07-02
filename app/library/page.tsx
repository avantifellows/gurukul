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
        <div className="flex flex-row mt-4 mb-8 lg:mb-12 justify-between md:mx-4 mx-1 lg:justify-center lg:gap-8">
          <PrimaryButton
            onClick={() => handleLibraryChange('Content')}
            className={`${buttonStyle} lg:w-64 lg:py-3 lg:text-lg ${selectedLibrary === 'Content' ? selectedButtonStyle + ' lg:shadow-lg' : unselectedButtonStyle + ' lg:hover:bg-gray-100 lg:transition-colors lg:duration-200'}`}
          >
            Content Library
          </PrimaryButton>
          {groupConfig.showClassLibrary && (
            <PrimaryButton
              onClick={() => handleLibraryChange('Class')}
              className={`${buttonStyle} lg:w-64 lg:py-3 lg:text-lg ${selectedLibrary === 'Class' ? selectedButtonStyle + ' lg:shadow-lg' : unselectedButtonStyle + ' lg:hover:bg-gray-100 lg:transition-colors lg:duration-200'}`}
            >
              Class Library
            </PrimaryButton>
          )}
        </div>
      )}

      {selectedLibrary === 'Content' && (
        <div className="bg-white lg:bg-transparent h-72 lg:h-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:mt-8">
              <div onClick={() => handleLibraryChange('NEET Content')} className="pt-4 lg:pt-0">
                <div className="bg-white rounded-xl shadow-md lg:shadow-lg h-24 lg:h-40 mt-2 my-10 lg:my-0 text-black flex items-center justify-start p-6 lg:p-8 mx-6 lg:mx-0 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border lg:border-gray-100">
                  <div className="flex items-center lg:flex-col lg:text-center w-full">
                    <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10 lg:w-16 lg:h-16 lg:mb-4" />
                    <div className="flex flex-col ml-4 lg:ml-0">
                      <h3 className="font-bold lg:text-xl text-gray-800">NEET Course</h3>
                      <h5 className="text-sm lg:text-base text-gray-600 lg:mt-2">Explore comprehensive NEET preparation materials</h5>
                    </div>
                  </div>
                </div>
              </div>
              <div onClick={() => handleLibraryChange('JEE Content')}>
                <div className="bg-white rounded-xl shadow-md lg:shadow-lg h-24 lg:h-40 mt-2 my-10 lg:my-0 text-black flex items-center justify-start p-6 lg:p-8 mx-6 lg:mx-0 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border lg:border-gray-100">
                  <div className="flex items-center lg:flex-col lg:text-center w-full">
                    <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10 lg:w-16 lg:h-16 lg:mb-4" />
                    <div className="flex flex-col ml-4 lg:ml-0">
                      <h3 className="font-bold lg:text-xl text-gray-800">JEE Mains Course</h3>
                      <h5 className="text-sm lg:text-base text-gray-600 lg:mt-2">Access complete JEE preparation resources</h5>
                    </div>
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
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:mt-8">
              <div onClick={() => handleLibraryChange('NEET Classes')} className="pt-4 lg:pt-0">
                <div className="bg-white rounded-xl shadow-md lg:shadow-lg h-24 lg:h-40 mt-2 my-10 lg:my-0 text-black flex items-center justify-start p-6 lg:p-8 mx-6 lg:mx-0 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border lg:border-gray-100">
                  <div className="flex items-center lg:flex-col lg:text-center w-full">
                    <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10 lg:w-16 lg:h-16 lg:mb-4" />
                    <div className="flex flex-col ml-4 lg:ml-0">
                      <h3 className="font-bold lg:text-xl text-gray-800">NEET Classes</h3>
                      <h5 className="text-sm lg:text-base text-gray-600 lg:mt-2">Access recorded NEET class sessions</h5>
                    </div>
                  </div>
                </div>
              </div>
              <div onClick={() => handleLibraryChange('JEE Classes')}>
                <div className="bg-white rounded-xl shadow-md lg:shadow-lg h-24 lg:h-40 mt-2 my-10 lg:my-0 text-black flex items-center justify-start p-6 lg:p-8 mx-6 lg:mx-0 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 border lg:border-gray-100">
                  <div className="flex items-center lg:flex-col lg:text-center w-full">
                    <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10 lg:w-16 lg:h-16 lg:mb-4" />
                    <div className="flex flex-col ml-4 lg:ml-0">
                      <h3 className="font-bold lg:text-xl text-gray-800">JEE Mains Classes</h3>
                      <h5 className="text-sm lg:text-base text-gray-600 lg:mt-2">Browse JEE class recordings and materials</h5>
                    </div>
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
