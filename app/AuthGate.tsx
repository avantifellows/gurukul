"use client";

import { useAuth } from "@/services/AuthContext";
import { usePathname } from "next/navigation";
import LandingPage from "@/app/landing/LandingPage";
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
      <div className="max-w-xl mx-auto">
        <Loading />
      </div>
    );
  }

  // Unauthenticated users see the landing page on any route
  if (!loggedIn) {
    return <LandingPage />;
  }

  // Authenticated users see the normal app with constrained mobile layout
  return (
    <div className="max-w-xl mx-auto border-x border-gray-300 shadow-2xl min-h-screen bg-heading">
      {children}
    </div>
  );
}
