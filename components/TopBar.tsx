"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/services/AuthContext";
import ProfileIcon from '../assets/profile.png';
import Image from "next/image";
import { deleteCookie } from "cookies-next";
import { MixpanelTracking } from "@/services/mixpanel";
import { MIXPANEL_EVENT } from "@/constants/config";

const TopBar = () => {
  const { userName, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const formatUserName = (userName: string) => {
    const names = userName.split(' ');
    const formattedNames = names.map(name =>
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    );
    return formattedNames.join(' ');
  };

  const pathname = usePathname();
  const routeNames: { [key: string]: string } = {
    '/reports': 'Report',
    '/library': 'Library',
    '/library/content': 'Library',
    '/library/class': 'Library',
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    deleteCookie("access_token", { path: '/', domain: '.avantifellows.org' });
    deleteCookie("refresh_token", { path: '/', domain: '.avantifellows.org' });
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    logout();
    MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.LOGOUT);
  };

  const UserNameShimmer = () => (
    <div className="flex flex-col gap-1 animate-pulse">
      <div>Welcome</div>
      <div className="h-5 w-32 bg-white/20 rounded"></div>
    </div>
  );

  // Determine what to show for the route name/username
  const getRouteNameContent = () => {
    const staticRouteName = routeNames[pathname];

    if (staticRouteName) {
      return staticRouteName;
    }

    // For home page, show welcome message with username or shimmer
    if (!userName) {
      return <UserNameShimmer />;
    }

    const formattedUserName = formatUserName(userName);
    return (
      <p>
        Welcome <br /> {formattedUserName}
      </p>
    );
  };

  return (
    <div className="max-w-xl mx-auto lg:max-w-none text-white p-4 lg:px-8 h-24 lg:h-16 flex items-center justify-between bg-primary lg:bg-white lg:text-gray-800 lg:border-b lg:border-gray-200 lg:shadow-sm">
      <div className="text-lg lg:text-xl font-semibold">
        {getRouteNameContent()}
      </div>
      <div className="relative">
        <Image
          src={ProfileIcon}
          alt="Profile"
          className="w-6 h-6 lg:w-8 lg:h-8 cursor-pointer hover:opacity-75 transition-opacity duration-200"
          onClick={toggleDropdown}
        />
        {isDropdownOpen && (
          <div className="absolute top-full right-1 bg-white p-2 shadow-lg text-black rounded-lg text-base w-32 grid grid-cols-1 gap-2 border border-gray-200 z-50">
            <button 
              onClick={handleLogout}
              className="hover:bg-gray-50 p-2 rounded transition-colors duration-200 text-left"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
