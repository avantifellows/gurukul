"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/Button';
import TopBar from '@/components/TopBar';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Image from 'next/image';
import StethoscopeIcon from '../../assets/stethoscope.png';
import BlueprintIcon from '../../assets/blueprint.png';

const Page: React.FC = () => {
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>('Content');
  const { push } = useRouter();

  const handleLibraryChange = (library: string) => {
    setSelectedLibrary(library);
  };

  useEffect(() => {
    if (selectedLibrary === 'NEET Content' || selectedLibrary === 'JEE Content') {
      push(`/library/show?course=${selectedLibrary}`);
    }
  }, [selectedLibrary, push]);

  const buttonStyle = 'mx-4 w-40 md:w-64';
  const selectedButtonStyle = 'bg-white text-primary font-semibold';
  const unselectedButtonStyle = 'bg-heading text-slate-600';

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
          <PrimaryButton
            onClick={() => handleLibraryChange('Class')}
            className={`${buttonStyle} ${selectedLibrary === 'Class' ? selectedButtonStyle : unselectedButtonStyle}`}
          >
            Class Library
          </PrimaryButton>
        </div>
      )}

      {selectedLibrary === 'Content' && (
        <div className="bg-white h-72">
          <div onClick={() => handleLibraryChange('NEET Content')} className="pt-4">
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6">
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
            <div className="bg-card rounded-md shadow-lg shadow-slate-400 h-24 mt-2 my-10 text-black flex items-center justify-start pl-4 mx-6">
              <div className="flex flex-row items-center">
                <Image src={BlueprintIcon} alt="Blueprint Icon" className="w-10 h-10" />
                <div className="flex flex-col ml-4 ">
                  <h3 className="font-semibold">JEE Mains course</h3>
                  <h5 className="text-sm">Browse all the JEE courses</h5>
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
