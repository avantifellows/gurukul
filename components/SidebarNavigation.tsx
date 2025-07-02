"use client"

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import NavLink from './NavLink';
import { MdOutlineLibraryBooks, MdLibraryBooks } from 'react-icons/md';
import { RiBarChart2Fill, RiBarChart2Line } from 'react-icons/ri';
import { IoHome, IoHomeOutline } from 'react-icons/io5';
import CapgeminiLogo from '../assets/capgemini_logo.png'

const SidebarNavigation = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <div className="hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:shadow-lg">
      {/* Logo/Brand Section */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Avanti Gurukul</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        <div className="mb-4">
          <NavLink href="/" active={isActive('/')}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50">
              {isActive('/') ? (
                <IoHome className="h-5 w-5 fill-primary" />
              ) : (
                <IoHomeOutline className="h-5 w-5 text-gray-600" />
              )}
              <span className={`font-medium ${isActive('/') ? 'text-primary' : 'text-gray-700'}`}>
                Home
              </span>
            </div>
          </NavLink>
        </div>

        <div className="mb-4">
          <NavLink href="/library" active={isActive('/library')}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50">
              {isActive('/library') ? (
                <MdLibraryBooks className="h-5 w-5 fill-primary" />
              ) : (
                <MdOutlineLibraryBooks className="h-5 w-5 text-gray-600" />
              )}
              <span className={`font-medium ${isActive('/library') ? 'text-primary' : 'text-gray-700'}`}>
                Library
              </span>
            </div>
          </NavLink>
        </div>

        <div className="mb-4">
          <NavLink href="/reports" active={isActive('/reports')}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-gray-50">
              {isActive('/reports') ? (
                <RiBarChart2Fill className="h-5 w-5 fill-primary" />
              ) : (
                <RiBarChart2Line className="h-5 w-5 text-gray-600" />
              )}
              <span className={`font-medium ${isActive('/reports') ? 'text-primary' : 'text-gray-700'}`}>
                Reports
              </span>
            </div>
          </NavLink>
        </div>
      </nav>

      {/* Powered by Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          Powered by
          <Image
            src={CapgeminiLogo}
            alt='Capgemini Logo'
            className='h-6 w-auto'
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarNavigation;