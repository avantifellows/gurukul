"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import AvantiLogo from "@/assets/avanti_logo.png";
import { api } from "@/services/url";
import groupConfig, { LOGIN_REGION_ORDER } from "@/config/groupConfig";

function buildGroupSections() {
  const regionMap: Record<string, { key: string; label: string }[]> = {};

  Object.entries(groupConfig).forEach(([key, config]) => {
    if (key === "defaultGroup" || !config.displayLabel || !config.region) return;

    if (!regionMap[config.region]) regionMap[config.region] = [];
    regionMap[config.region].push({ key, label: config.displayLabel });
  });

  return LOGIN_REGION_ORDER
    .filter((region) => regionMap[region]?.length > 0)
    .map((region) => ({ region, groups: regionMap[region] }));
}

export default function LoginPage() {
  const portalBaseUrl = api.portal.frontend.baseUrl;
  const sections = buildGroupSections();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ maxWidth: "100vw" }}>
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src={AvantiLogo} alt="Avanti Fellows" className="w-9 h-9" />
            <span className="text-lg font-bold text-gray-900 tracking-tight">Gurukul</span>
          </Link>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center pt-8 sm:pt-16 pb-16 px-4">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Log in to Gurukul
            </h1>
            <p className="text-gray-500 text-base sm:text-lg">
              Select your group to continue to the login page.
            </p>
          </div>

          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.region}>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                  {section.region}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.groups.map((group) => (
                    <a
                      key={group.key}
                      href={`${portalBaseUrl}/?group=${group.key}&platform=gurukul`}
                      className="group flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-primary hover:shadow-md hover:shadow-teal-50 transition-all duration-200"
                    >
                      <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                        {group.label}
                      </span>
                      <svg
                        className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-400 text-sm mt-10">
            Not sure which group? Contact your school coordinator or{" "}
            <a
              href="https://avantifellows.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              visit Avanti Fellows
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
