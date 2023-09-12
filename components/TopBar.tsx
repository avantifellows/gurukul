"use client"

import CurrentTime from "./CurrentTime";
const TopBar = () => {

  return (
    <div className="text-white p-4 h-32 justify-between items-center bg-primary">
      <CurrentTime className="text-sm mb-4" />
      <div className="text-xl font-semibold"> Welcome, <br /> Aman Bahuguna </div>
      <div className="flex items-center space-x-4">
      </div>
    </div>
  );
};

export default TopBar;
