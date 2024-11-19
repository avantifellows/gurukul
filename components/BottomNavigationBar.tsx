"use client"

import { usePathname } from 'next/navigation';
import AvantiLogo from '../assets/avanti_logo.png';
import Image from 'next/image';
import NavLink from './NavLink';
import { MdOutlineLibraryBooks, MdLibraryBooks } from 'react-icons/md';
import { RiBarChart2Fill, RiBarChart2Line } from 'react-icons/ri';
import CapgeminiLogo from '../assets/capgemini_logo.png'

const BottomNavigationBar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }

    return pathname.startsWith(path);
  };


  return (
    <div className="relative">
      <div className="max-w-xl mx-auto fixed bottom-[72px] left-0 right-0 bg-gray-100 border-t-2 shadow-2xl  shadow-black text-center py-2 text-xs text-gray-700 pb-4 md:pb-8 md:text-lg">
        <div className="flex items-center justify-center gap-1 md:gap-2">
          Powered by
          <Image
            src={CapgeminiLogo}
            alt='Capgemini Logo'
            className='h-5 md:h-8 w-auto'
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto fixed bottom-0 left-0 right-0 text-xs md:text-lg px-12 md:px-16 bg-white pb-4 pt-2 flex justify-between items-center">
        <NavLink href="/library" active={isActive('/library')}>
          {isActive('/library') ? (
            <MdLibraryBooks className="h-8 w-8 fill-primary" />
          ) : (
            <MdOutlineLibraryBooks className="h-8 w-8" />
          )}
          Library
        </NavLink>
        <NavLink href="/" active={isActive('/')}>
          <Image
            src={AvantiLogo}
            alt="Avanti Logo"
            className="w-12 h-12 absolute bottom-10 md:bottom-11 md:w-14 md:h-14 border-2 rounded-full"
          />
          <span className="pt-8">Home</span>
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