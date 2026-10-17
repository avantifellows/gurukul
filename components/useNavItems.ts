"use client";

import { usePathname } from "next/navigation";
import { IconType } from "react-icons";
import { MdOutlineLibraryBooks, MdLibraryBooks } from "react-icons/md";
import { RiBarChart2Fill, RiBarChart2Line } from "react-icons/ri";
import { IoHome, IoHomeOutline } from "react-icons/io5";
import { useAuth } from "@/services/AuthContext";

export interface NavItem {
  href: string;
  label: string;
  activeIcon: IconType;
  inactiveIcon: IconType;
  isActive: boolean;
}

/**
 * The tabs a group is allowed to see, in reading order (Home first).
 *
 * The phone bottom bar re-orders these to put Home in the middle, within thumb
 * reach; the desktop rail reads top-to-bottom and keeps this order. Both
 * surfaces derive from here so a group's tab visibility can never drift
 * between them.
 */
export function useNavItems(homeLabel?: string): NavItem[] {
  const pathname = usePathname();
  const { groupConfig } = useAuth();

  const isActive = (path: string) =>
    path === "/" ? pathname === path : pathname.startsWith(path);

  const displayHomeLabel = homeLabel || groupConfig.homeTabLabel || "Home";

  return [
    ...(groupConfig.showHomeTab !== false
      ? [
          {
            href: "/",
            label: displayHomeLabel,
            activeIcon: IoHome,
            inactiveIcon: IoHomeOutline,
            isActive: isActive("/"),
          },
        ]
      : []),
    ...(groupConfig.showLibraryTab === false
      ? []
      : [
          {
            href: "/library",
            label: "Library",
            activeIcon: MdLibraryBooks,
            inactiveIcon: MdOutlineLibraryBooks,
            isActive: isActive("/library"),
          },
        ]),
    ...(groupConfig.showReportsTab === false
      ? []
      : [
          {
            href: "/reports",
            label: "Report",
            activeIcon: RiBarChart2Fill,
            inactiveIcon: RiBarChart2Line,
            isActive: isActive("/reports"),
          },
        ]),
  ];
}

/**
 * Title and one-line context for the desktop page header. The phone build has
 * no room for either, so it keeps showing the greeting bar instead.
 */
export function getPageHeading(pathname: string, homeLabel: string) {
  if (pathname.startsWith("/reports")) {
    return { title: "Test Reports", subtitle: "Your past attempts and analysis" };
  }
  if (pathname.startsWith("/library")) {
    return { title: "Library", subtitle: "Courses, chapters and recordings" };
  }
  return { title: homeLabel, subtitle: null as string | null };
}
