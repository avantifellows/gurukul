"use client";

import { useAuth } from "@/services/AuthContext";
import { usePathname } from "next/navigation";
import LandingPage from "@/app/landing/LandingPage";
import DesktopSidebar from "@/components/DesktopSidebar";
import Loading from "./loading";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { loggedIn, isLoading } = useAuth();
  const pathname = usePathname();

  // Login page is always accessible (it's a public route with group links)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto lg:max-w-3xl">
        <Loading />
      </div>
    );
  }

  // Unauthenticated users see the landing page on any route
  if (!loggedIn) {
    return <LandingPage />;
  }

  // Authenticated users get the phone-width column below `lg`, and the full
  // canvas beside a persistent navigation rail above it.
  return (
    <div className="lg:bg-surface">
      <DesktopSidebar />
      <div className="max-w-xl mx-auto border-x border-gray-300 shadow-2xl min-h-screen bg-heading lg:max-w-none lg:mx-0 lg:border-x-0 lg:shadow-none lg:bg-transparent lg:pl-rail">
        {children}
      </div>
    </div>
  );
}
