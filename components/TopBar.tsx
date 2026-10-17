"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/services/AuthContext";
import ProfileIcon from '../assets/profile.png';
import Image from "next/image";
import { MixpanelTracking } from "@/services/mixpanel";
import { MIXPANEL_EVENT } from "@/constants/config";
import { getPageHeading } from "./useNavItems";

const TopBar = () => {
  const { userName, logout, groupConfig } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [today, setToday] = useState("");

  // Formatted on the client only: the server renders in UTC, and around
  // midnight IST that would disagree with the browser and trip hydration.
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    );
  }, []);

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
    logout();
    MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.LOGOUT, { action: 'logout_clicked' });
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

  const heading = getPageHeading(pathname, groupConfig.homeTabLabel || "Home");
  // On the home page the schedule is the content, so the date is the most
  // useful thing the header can say; identity already lives in the rail.
  const subtitle = pathname === "/" ? today : heading.subtitle;

  return (
    <>
      {/* Phone: the original greeting bar, unchanged. */}
      <div className="lg:hidden max-w-xl mx-auto text-white p-4 h-24 flex items-center justify-between bg-primary">
        <div className="text-lg font-semibold">
          {getRouteNameContent()}
        </div>
        <div className="relative">
          <Image
            src={ProfileIcon}
            alt="Profile"
            className="w-6 h-6 cursor-pointer"
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="absolute top-full right-1 bg-white p-2 shadow-md text-black rounded-lg text-base w-32 grid grid-cols-1 gap-2 z-50">
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      {/* Desktop: a page header. Navigation and identity sit in the rail, so
          this only has to say where you are and, on the home page, when. */}
      <header className="hidden lg:block sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-line">
        <div className="mx-auto max-w-6xl px-10 h-20 flex flex-col justify-center">
          <h1 className="text-[28px] leading-none font-bold tracking-tight text-ink">
            {heading.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 min-h-[1.25rem]" suppressHydrationWarning>
            {subtitle}
          </p>
        </div>
      </header>
    </>
  );
};

export default TopBar;
