"use client"

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import NavLink from './NavLink';
import { MdOutlineLibraryBooks, MdLibraryBooks } from 'react-icons/md';
import { RiBarChart2Fill, RiBarChart2Line } from 'react-icons/ri';
import { IoHome, IoHomeOutline } from 'react-icons/io5';
import CapgeminiLogo from '../assets/capgemini_logo.png'
import { BottomNavigationBarProps } from '@/app/types';
import { useAuth } from '@/services/AuthContext';

const BottomNavigationBar = ({ homeLabel }: BottomNavigationBarProps) => {
  const pathname = usePathname();
  const { group } = useAuth();

  // Determine the home label based on group or provided prop
  const displayHomeLabel = homeLabel || (group === 'EnableStudents' ? 'Practice test' : 'Home');

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }

    return pathname.startsWith(path);
  };

  return (
    <div className="relative">
      <div className="mx-auto fixed bottom-[72px] left-0 right-0 bg-gray-100 border-t-2 shadow-2xl  shadow-black text-center py-2 text-xs text-gray-700 md:pb-4 md:text-lg">
        <div className="flex items-center justify-center gap-1 md:gap-2">
          Powered by
          <Image
            src={CapgeminiLogo}
            alt='Capgemini Logo'
            className='h-5 md:h-8 w-auto'
          />
        </div>
      </div>

      <div className="mx-auto fixed bottom-0 left-0 right-0 text-xs md:text-lg px-12 md:px-16 bg-white pb-4 pt-2 flex justify-between items-center">
        <NavLink href="/library" active={isActive('/library')}>
          {isActive('/library') ? (
            <MdLibraryBooks className="h-8 w-8 fill-primary" />
          ) : (
            <MdOutlineLibraryBooks className="h-8 w-8" />
          )}
          Library
        </NavLink>
        <NavLink href="/" active={isActive('/')}>
          {isActive('/') ? (
            <IoHome className="h-8 w-8 fill-primary" />
          ) : (
            <IoHomeOutline className="h-8 w-8" />
          )}
          {displayHomeLabel}
        </NavLink>
        <NavLink href="/reports" active={isActive('/reports')}>
          {isActive('/reports') ? (
            <RiBarChart2Fill className="h-8 w-8 fill-primary" />
          ) : (
            <RiBarChart2Line className="h-8 w-8" />
          )}
          Report
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNavigationBar;