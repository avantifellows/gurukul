"use client"

import { Icon } from '@iconify/react';
import { usePathname } from 'next/navigation';
import AvantiLogo from '../assets/avanti_logo.png';
import Image from 'next/image';
import NavLink from './NavLink';

const BottomNavigation = () => {
  const pathname = usePathname();

  const iconStyle = {
    fontSize: '32px',
    color: 'black',
  };

  const activeIconStyle = {
    fontSize: '32px',
    color: '#008181',
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 text-xs md:text-lg pl-16 pr-16 bg-white pb-4 pt-2 flex justify-between border-t-2 items-center shadow-2xl shadow-black">
      <NavLink href="/library" active={isActive('/library')}>
        <Icon
          icon="ic:round-library-books"
          style={isActive('/library') ? activeIconStyle : iconStyle}
        />
        Library
      </NavLink>
      <NavLink href="/" active={isActive('/')}>
        <Image src={AvantiLogo} alt="Avanti Logo" className="w-12 h-12 absolute bottom-10 border-2 rounded-full" />
        <span className="pt-8">Home</span>
      </NavLink>
      <NavLink href="/reports" active={isActive('/reports')}>
        <Icon
          icon="uil:graph-bar"
          style={isActive('/reports') ? activeIconStyle : iconStyle}
        />
        Report
      </NavLink>
    </div>
  );
};

export default BottomNavigation;
