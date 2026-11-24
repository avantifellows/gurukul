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
      <div className="max-w-xl mx-auto sm:max-w-3xl">
        <Loading />
      </div>
    );
  }

  // Unauthenticated users see the landing page on any route
  if (!loggedIn) {
    return <LandingPage />;
  }

  // Content is fluid at every width. Below `sm` the bottom bar navigates; from
  // `sm` up a navigation rail does: icon-only until `lg`, full after.
  return (
    <div className="lg:bg-surface">
      <DesktopSidebar />
      <div className="min-h-screen bg-heading sm:pl-rail-collapsed lg:bg-transparent lg:pl-rail">
        {children}
      </div>
    </div>
  );
}
