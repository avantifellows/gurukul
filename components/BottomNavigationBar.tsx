"use client"

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import NavLink from './NavLink';
import { MdOutlineLibraryBooks, MdLibraryBooks } from 'react-icons/md';
import { RiBarChart2Fill, RiBarChart2Line } from 'react-icons/ri';
import { IoHome, IoHomeOutline } from 'react-icons/io5';
import CapgeminiLogo from '../assets/capgemini_logo.png'
import { BottomNavigationBarProps } from '@/app/types';
import { getGroupConfig } from '@/config/groupConfig';
import { useAuth } from '@/services/AuthContext';

const BottomNavigationBar = ({ homeLabel }: BottomNavigationBarProps) => {
  const pathname = usePathname();
  const { group } = useAuth();
  const groupConfig = getGroupConfig(group || 'defaultGroup');

  // Determine the home label from config or provided prop
  const displayHomeLabel = homeLabel || groupConfig.homeTabLabel || 'Home';

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // Navigation items configuration
  const navItems = [
    {
      href: '/library',
      label: 'Library',
      activeIcon: MdLibraryBooks,
      inactiveIcon: MdOutlineLibraryBooks,
      isActive: isActive('/library')
    },
    ...(groupConfig.showHomeTab !== false ? [{
      href: '/',
      label: displayHomeLabel,
      activeIcon: IoHome,
      inactiveIcon: IoHomeOutline,
      isActive: isActive('/')
    }] : []),
    {
      href: '/reports',
      label: 'Report',
      activeIcon: RiBarChart2Fill,
      inactiveIcon: RiBarChart2Line,
      isActive: isActive('/reports')
    }
  ];

  const renderNavItem = (item: typeof navItems[0]) => {
    const IconComponent = item.isActive ? item.activeIcon : item.inactiveIcon;
    const iconClass = `h-8 w-8 ${item.isActive ? 'fill-primary' : ''}`;

    return (
      <NavLink key={item.href} href={item.href} active={item.isActive}>
        <IconComponent className={iconClass} />
        {item.label}
      </NavLink>
    );
  };

  return (
    <div className="relative">
      {/* Powered by section */}
      <div className="max-w-xl mx-auto fixed bottom-[72px] left-0 right-0 bg-gray-100 border-t-2 shadow-2xl shadow-black text-center py-2 text-xs text-gray-700 md:pb-4 md:text-lg">
        <div className="flex items-center justify-center gap-1 md:gap-2">
          Powered by
          <Image
            src={CapgeminiLogo}
            alt='Capgemini Logo'
            className='h-5 md:h-8 w-auto'
          />
        </div>
      </div>

      {/* Navigation bar */}
      <div className={`max-w-xl mx-auto fixed bottom-0 left-0 right-0 text-xs md:text-lg px-12 md:px-16 bg-white pb-4 pt-2 flex items-center ${navItems.length === 3 ? 'justify-between' : ''}`}>
        {navItems.length === 3 ? (
          // Original layout for 3 icons
          navItems.map(renderNavItem)
        ) : (
          // Improved layout for 2 icons (when home is hidden)
          navItems.map(item => (
            <div key={item.href} className="flex-1 flex justify-center">
              {renderNavItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BottomNavigationBar;