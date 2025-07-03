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
    if (
      selectedLibrary === 'NEET Content' ||
      selectedLibrary === 'JEE Content' ||
      selectedLibrary === 'JEE Advance Content' ||
      selectedLibrary === 'CLAT Content' ||
      selectedLibrary === 'CA Content'
    ) {
      push(`/library/content?course=${selectedLibrary}`);
    }
    if (
      selectedLibrary === 'NEET Classes' ||
      selectedLibrary === 'JEE Classes'
    ) {
      push(`/library/class?course=${selectedLibrary}`);
    }
  }, [selectedLibrary, push]);

  const buttonStyle = 'mx-4 w-48 md:w-72 whitespace-nowrap';
  const selectedButtonStyle = 'bg-white text-primary font-semibold py-2 rounded-lg shadow-sm';
  const unselectedButtonStyle = 'bg-heading text-slate-600 py-2 rounded-lg';

  return (
    <main className="max-w-xl mx-auto bg-heading min-h-screen">
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
        <div className="bg-white pb-40">
          <div onClick={() => handleLibraryChange('NEET Content')} className="pt-4">
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6 cursor-pointer">
              <div className="flex items-center">
                <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10" />
                <div className="flex flex-col ml-4 ">
                  <h3 className="font-semibold">NEET course</h3>
                  <h5 className="text-sm">Browse all the NEET courses</h5>
                </div>
              </div>
            </div>
          </div>
          <div onClick={() => handleLibraryChange('JEE Content')}>
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6 cursor-pointer">
              <div className="flex flex-row items-center">
                <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10" />
                <div className="flex flex-col ml-4 ">
                  <h3 className="font-semibold">JEE Mains course</h3>
                  <h5 className="text-sm">Browse all the JEE courses</h5>
                </div>
              </div>
            </div>
          </div>
          <div onClick={() => handleLibraryChange('JEE Advance Content')}>
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6 cursor-pointer">
              <div className="flex flex-row items-center">
                <MdScience className="w-10 h-10 text-blue-700" />
                <div className="flex flex-col ml-4 ">
                  <h3 className="font-semibold">JEE Advance course</h3>
                  <h5 className="text-sm">Browse all the JEE Advance courses</h5>
                </div>
              </div>
            </div>
          </div>
          <div onClick={() => handleLibraryChange('CLAT Content')}>
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6 cursor-pointer">
              <div className="flex flex-row items-center">
                <GiScales className="w-10 h-10 text-green-700" />
                <div className="flex flex-col ml-4 ">
                  <h3 className="font-semibold">CLAT course</h3>
                  <h5 className="text-sm">Browse all the CLAT courses</h5>
                </div>
              </div>
            </div>
          </div>
          <div onClick={() => handleLibraryChange('CA Content')}>
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6 cursor-pointer">
              <div className="flex flex-row items-center">
                <FaRupeeSign className="w-10 h-10 text-yellow-700" />
                <div className="flex flex-col ml-4 ">
                  <h3 className="font-semibold">CA course</h3>
                  <h5 className="text-sm">Browse all the CA courses</h5>
                </div>
              </div>
            </div>
          </div>
          <BottomNavigationBar />
        </div>
      )}

      {selectedLibrary === 'Class' && (
        <div className="bg-white h-72">
          <div onClick={() => handleLibraryChange('NEET Classes')} className="pt-4">
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6">
              <div className="flex items-center">
                <Image src={StethoscopeIcon} alt="Stethoscope Icon" className="w-10 h-10" />
                <div className="flex flex-col ml-4 ">
                  <h3 className="font-semibold">NEET classes</h3>
                  <h5 className="text-sm">Browse all the NEET classes</h5>
                </div>
              </div>
            </div>
          </div>
          <div onClick={() => handleLibraryChange('JEE Classes')}>
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6">
              <div className="flex flex-row items-center">
                <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10" />
                <div className="flex flex-col ml-4 ">
                  <h3 className="font-semibold">JEE Mains classes</h3>
                  <h5 className="text-sm">Browse all the JEE classes</h5>
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
