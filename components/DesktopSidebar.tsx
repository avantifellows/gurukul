"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/services/AuthContext";
import { useNavItems } from "./useNavItems";
import AvantiLogo from "../assets/avanti_logo.png";
import CapgeminiLogo from "../assets/capgemini_logo.png";
import TataMotorsLogo from "../assets/tata_motors_logo.png";
import { MixpanelTracking } from "@/services/mixpanel";
import { MIXPANEL_EVENT } from "@/constants/config";

const formatUserName = (userName: string) =>
  userName
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())
    .join(" ");

const initialsOf = (userName: string) =>
  userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

/**
 * Persistent navigation for screens wide enough to keep it on-screen all the
 * time. Below `lg` it is not rendered at all and BottomNavigationBar takes over,
 * so the phone layout is untouched.
 */
const DesktopSidebar = () => {
  const { userName, logout, groupConfig } = useAuth();
  const navItems = useNavItems();
  const sponsorLogosMode = groupConfig.homepageSponsorLogos ?? "default";

  const handleLogout = () => {
    logout();
    MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.LOGOUT, {
      action: "logout_clicked",
    });
  };

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 w-rail flex-col bg-ink text-white">
      <div className="flex items-center gap-3 px-6 h-20 shrink-0">
        <Image src={AvantiLogo} alt="" aria-hidden className="w-9 h-9 shrink-0" />
        <div className="leading-tight">
          <div className="text-lg font-bold tracking-tight">Gurukul</div>
          <div className="text-[11px] text-white/45">by Avanti Fellows</div>
        </div>
      </div>

      <nav className="flex-1 px-3 pt-2" aria-label="Main">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.isActive ? item.activeIcon : item.inactiveIcon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={item.isActive ? "page" : undefined}
                  className={`relative flex items-center gap-3 h-11 px-3 rounded-lg text-[15px] transition-colors ${
                    item.isActive
                      ? "bg-white/[0.09] text-white font-semibold"
                      : "text-white/60 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {item.isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-white" />
                  )}
                  <Icon className="w-5 h-5 shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 pb-4 shrink-0">
        <div className="rounded-xl bg-white/[0.04] px-4 py-3 mb-3">
          <div className="flex items-center justify-around gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-white/40">powered by</span>
              <span className="bg-white rounded px-2 py-1">
                <Image
                  src={CapgeminiLogo}
                  alt="Capgemini"
                  className="h-4 w-auto object-contain"
                />
              </span>
            </div>
            {sponsorLogosMode !== "capgeminiOnly" && (
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-white/40">supported by</span>
                <span className="bg-white rounded px-2 py-1">
                  <Image
                    src={TataMotorsLogo}
                    alt="Tata Motors"
                    className="h-4 w-auto object-contain"
                  />
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-white/10 pt-3">
          <div
            className="w-9 h-9 shrink-0 rounded-full bg-primary flex items-center justify-center text-sm font-semibold"
            aria-hidden
          >
            {userName ? initialsOf(userName) : ""}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium truncate">
              {userName ? formatUserName(userName) : " "}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
