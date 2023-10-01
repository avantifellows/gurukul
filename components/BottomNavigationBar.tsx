"use client"

import { usePathname } from 'next/navigation';
import AvantiLogo from '../assets/avanti_logo.png';
import Image from 'next/image';
import NavLink from './NavLink';
import { MdOutlineLibraryBooks, MdLibraryBooks } from 'react-icons/md';
import { RiBarChart2Fill, RiBarChart2Line } from 'react-icons/ri';

const BottomNavigationBar = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 text-xs md:text-lg pl-16 pr-16 bg-white pb-4 pt-2 flex justify-between border-t-2 items-center shadow-2xl shadow-black">
      <NavLink href="/library" active={isActive('/library')}>
        {isActive('/library') ? (
          <MdLibraryBooks className='h-8 w-8 fill-primary' />
        ) : (
          <MdOutlineLibraryBooks className='h-8 w-8' />
        )}
        Library
      </NavLink>
      <NavLink href="/" active={isActive('/')}>
        <Image src={AvantiLogo} alt="Avanti Logo" className="w-12 h-12 absolute bottom-10 border-2 rounded-full" />
        <span className="pt-8">Home</span>
      </NavLink>
      <NavLink href="/reports" active={isActive('/reports')}>
        {isActive('/reports') ? (
          <RiBarChart2Fill className='h-8 w-8 fill-primary' />
        ) : (
          <RiBarChart2Line className='h-8 w-8' />
        )}
        Report
      </NavLink>
    </div>
  );
};

export default BottomNavigationBar;