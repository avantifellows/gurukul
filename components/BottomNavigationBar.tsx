"use client"

import Image from 'next/image';
import NavLink from './NavLink';
import CapgeminiLogo from '../assets/capgemini_logo.png'
import TataMotorsLogo from '../assets/tata_motors_logo.png'
import { BottomNavigationBarProps } from '@/app/types';
import { useAuth } from '@/services/AuthContext';
import { useNavItems, NavItem } from './useNavItems';

const BottomNavigationBar = ({ homeLabel }: BottomNavigationBarProps) => {
  const { groupConfig } = useAuth();
  const sponsorLogosMode = groupConfig.homepageSponsorLogos ?? 'default';

  // Shared with the desktop rail, then re-ordered: on a phone Home belongs in
  // the middle, within thumb reach.
  const items = useNavItems(homeLabel);
  const home = items.find(item => item.href === '/');
  const navItems = [
    ...items.filter(item => item.href === '/library'),
    ...(home ? [home] : []),
    ...items.filter(item => item.href === '/reports'),
  ];

  const renderNavItem = (item: NavItem) => {
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
    <div className="relative lg:hidden">
      {/* Powered by section */}
      <div className="max-w-xl mx-auto fixed bottom-[72px] left-0 right-0 bg-gray-100 border-t-2 shadow-2xl shadow-black px-4 py-2 text-xs text-gray-700 md:px-8 md:py-3 md:text-sm flex items-center">
        {sponsorLogosMode === 'capgeminiOnly' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-0.5 md:gap-1 text-center">
            powered by
            <Image
              src={CapgeminiLogo}
              alt="Capgemini Logo"
              className="h-5 w-auto object-contain md:h-8"
            />
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 md:gap-1 text-center">
              powered by
              <Image
                src={CapgeminiLogo}
                alt="Capgemini Logo"
                className="h-5 w-auto object-contain md:h-8"
              />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-0.5 md:gap-1 md:pb-2 text-center">
              supported by
              <Image
                src={TataMotorsLogo}
                alt="Tata Motors Logo"
                className="h-5 w-auto object-contain md:h-8"
              />
            </div>
          </>
        )}
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
