"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import AvantiLogo from "@/assets/avanti_logo.png";
import CapgeminiLogo from "@/assets/capgemini_logo.png";
import TataMotorsLogo from "@/assets/tata_motors_logo.png";
import { api } from "@/services/url";

const FEATURES = [
  {
    id: "tests",
    title: "Practice & Mock Tests",
    description:
      "Take mock JEE/NEET tests to assess your preparation and practice tests to sharpen your skills. Timed, exam-like conditions so you're ready on the big day.",
    color: "from-teal-500 to-emerald-600",
    accent: "#0d9488",
    screenshot: "/landing/screenshot_tests.webp",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="6" y="4" width="36" height="40" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <path d="M16 18l4 4 8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="30" x2="32" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <line x1="16" y1="36" x2="28" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: "library",
    title: "Content Library",
    description:
      "Access 5,000+ videos that explain chapters and topics in detail. Curated by expert educators to help you ace JEE, NEET, and board exams.",
    color: "from-amber-500 to-orange-600",
    accent: "#d97706",
    screenshot: "/landing/screenshot_library.webp",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="4" y="8" width="16" height="32" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <rect x="24" y="8" width="16" height="32" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <circle cx="32" cy="24" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M30.5 22v4l3-2z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "reports",
    title: "Detailed Test Reports",
    description:
      "Get performance reports with accuracy and attempt rate breakdowns. See subject-wise and chapter-wise analysis to clearly identify your strengths and areas to improve.",
    color: "from-violet-500 to-purple-600",
    accent: "#7c3aed",
    screenshot: "/landing/screenshot_reports.webp",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-10 h-10">
        <rect x="6" y="6" width="36" height="36" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <rect x="12" y="26" width="6" height="10" rx="1" fill="currentColor" opacity="0.6" />
        <rect x="21" y="20" width="6" height="16" rx="1" fill="currentColor" opacity="0.8" />
        <rect x="30" y="14" width="6" height="22" rx="1" fill="currentColor" />
      </svg>
    ),
  },
];

// Animated counter component
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const portalBaseUrl = api.portal.frontend.baseUrl;
  const registerUrl = `${portalBaseUrl}/?group=AllIndiaStudents&platform=gurukul&signup_form=true&signup_form_id=23&id_generation=true&type=sign-up`;
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" style={{ maxWidth: "100vw" }}>
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src={AvantiLogo} alt="Avanti Fellows" className="w-9 h-9" />
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                Gurukul
              </span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-2 font-medium">
                by Avanti Fellows
              </span>
            </div>
          </div>
          <Link
            href="/login"
            className="bg-primary hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-teal-200"
          >
            Log In
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-50 via-emerald-50/50 to-transparent rounded-full translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-50/60 to-transparent rounded-full -translate-x-1/4 translate-y-1/4" />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, #008181 1px, transparent 1px)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-50 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              India&apos;s Largest Online Test Prep Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Your exam prep,{" "}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">
                  simplified
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path
                    d="M2 8c40-6 80-6 120-2s56 4 76-2"
                    stroke="#008181"
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.3"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl">
              Join over{" "}
              <span className="font-bold text-gray-900">2,00,000 students</span>{" "}
              preparing for JEE, NEET, and competitive exams. Fast, easy to use,
              and designed for your phone.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={registerUrl}
                className="inline-flex items-center justify-center bg-primary hover:bg-teal-700 text-white font-semibold px-8 py-3.5 rounded-full text-base transition-all duration-200 hover:shadow-xl hover:shadow-teal-200/50 hover:-translate-y-0.5"
              >
                Get Started Free
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <a
                href="#tutorial"
                className="inline-flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-8 py-3.5 rounded-full text-base transition-all duration-200 border border-gray-200"
              >
                <svg className="mr-2 w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Tutorial
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg">
            {[
              { value: 200000, suffix: "+", label: "Students" },
              { value: 5000, suffix: "+", label: "Videos" },
              { value: 10, suffix: "+", label: "States" },
            ].map((stat, i) => (
              <div key={i} className="text-center sm:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-gray-500 font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-20 sm:py-28 bg-gray-50/50" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything you need to crack your exam
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Practice tests, video lessons, and detailed analytics — all in one place.
            </p>
          </div>

          {/* Feature tabs */}
          <div className="flex justify-center gap-2 mb-12">
            {FEATURES.map((feature, i) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(i)}
                className={`px-4 sm:px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeFeature === i
                    ? "bg-primary text-white shadow-lg shadow-teal-200/50"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span className="hidden sm:inline">{feature.title}</span>
                <span className="sm:hidden">{feature.title.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Feature content */}
          {FEATURES.map((feature, i) => (
            <div
              key={feature.id}
              className={`transition-all duration-500 ${
                activeFeature === i
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 hidden"
              }`}
            >
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Text side */}
                  <div className="p-8 sm:p-12 flex flex-col justify-center">
                    <div className="text-primary mb-4">{feature.icon}</div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  {/* Screenshot */}
                  <div className={`bg-gradient-to-br ${feature.color} p-8 sm:p-12 flex items-center justify-center min-h-[300px] sm:min-h-[400px]`}>
                    <div className="w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border-2 border-white/20">
                      <Image
                        src={feature.screenshot}
                        alt={`${feature.title} screenshot`}
                        width={401}
                        height={781}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== VIDEO TUTORIAL ===== */}
      <section className="py-20 sm:py-28" id="tutorial">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 sm:p-14 overflow-hidden relative">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full blur-2xl" />

            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
                  Get Started Today
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Watch this tutorial to learn how to navigate the platform, take mock tests,
                  access learning resources, and track your progress with performance reports.
                </p>
              </div>

              {/* YouTube Embed */}
              <div className="max-w-3xl mx-auto">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/30" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src="https://www.youtube.com/embed/QvgSAkB52WM"
                    title="Gurukul Platform Walkthrough"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Quick links below video */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 max-w-3xl mx-auto">
                {[
                  { label: "Navigate the platform", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                  { label: "Take mock tests", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
                  { label: "Access resources", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
                  { label: "Track progress", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <svg className="w-6 h-6 mx-auto text-teal-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <p className="text-white/70 text-xs sm:text-sm font-medium">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-white to-teal-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Ready to start preparing?
          </h2>
          <p className="text-gray-500 text-lg mb-8 max-w-lg mx-auto">
            Join lakhs of students already using Gurukul to prepare for their exams.
          </p>
          <a
            href={registerUrl}
            className="inline-flex items-center justify-center bg-primary hover:bg-teal-700 text-white font-semibold px-10 py-4 rounded-full text-lg transition-all duration-200 hover:shadow-xl hover:shadow-teal-200/50 hover:-translate-y-0.5"
          >
            Get Started Now
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </section>

      {/* ===== DONORS ===== */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-20">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Powered by</span>
              <Image src={CapgeminiLogo} alt="Capgemini" className="h-8 sm:h-10 w-auto object-contain" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Supported by</span>
              <Image src={TataMotorsLogo} alt="Tata Motors" className="h-8 sm:h-10 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src={AvantiLogo} alt="Avanti Fellows" className="w-8 h-8" />
              <span className="text-white font-bold">Avanti Gurukul</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Avanti Fellows. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
