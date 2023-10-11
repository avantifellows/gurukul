"use client";

import { usePathname } from "next/navigation";
import CurrentTime from "./CurrentTime";

const TopBar = () => {
  const routeNames: { [key: string]: string } = {
    '/reports': 'Report',
    '/library': 'Library',
  };

  const pathname = usePathname();
  const routeName = routeNames[pathname] || "Welcome";

  return (
    <div className="text-white p-4 h-32 justify-between items-center bg-primary">
      <CurrentTime className="text-sm mb-4" />
      <div className="mt-8 text-xl font-semibold">
        {routeName}
      </div>
      <div className="flex items-center space-x-4"></div>
    </div>
  );
};

export default TopBar;
