"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import CurrentTime from "./CurrentTime";
import { useAuth } from "@/services/AuthContext";
import ProfileIcon from '../assets/profile.png';
import Image from "next/image";
import { deleteCookie } from "cookies-next";

const TopBar = () => {
  const { userName } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const routeNames: { [key: string]: string } = {
    '/reports': 'Report',
    '/library': 'Library',
    '/library/show': 'Library',
  };

  const pathname = usePathname();
  const routeName = routeNames[pathname] || <p>Welcome <br /> {userName} </p>;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    deleteCookie("access_token", { path: '/', domain: '.avantifellows.org' });
    deleteCookie("refresh_token", { path: '/', domain: '.avantifellows.org' });
    window.location.reload();
  };

  return (
    <div className="max-w-xl mx-auto text-white p-4 h-32 justify-between items-center bg-primary">
      <CurrentTime className="text-sm mb-4" />
      <div className="mt-6 text-lg font-semibold justify-between flex mr-4 items-center">
        {routeName}
        <div className="relative">
          <Image
            src={ProfileIcon}
            alt="Profile"
            className="w-6 h-6 cursor-pointer"
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="absolute top-full right-1 bg-white p-2 shadow-md text-black rounded-lg text-base w-32 grid grid-cols-1 gap-2">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-4"></div>
    </div>
  );
};

export default TopBar;
