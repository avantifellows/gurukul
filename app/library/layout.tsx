"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/services/AuthContext";
import { isLibraryRouteAllowed } from "@/utils/libraryAccess";

/**
 * Keeps programs out of library routes they have switched off. AuthGate only
 * renders this once auth and the program config have loaded, so the flags are
 * final here. Nothing is rendered (and nothing fetched) for a blocked route;
 * the student is sent home with `replace` so Back does not return them here.
 */
export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { groupConfig } = useAuth();
  const allowed = isLibraryRouteAllowed(pathname, groupConfig);
  const fallback = groupConfig.showHomeTab === false ? "/reports" : "/";

  useEffect(() => {
    if (!allowed) router.replace(fallback);
  }, [allowed, fallback, router]);

  return allowed ? <>{children}</> : null;
}
