"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import Loading from "../loading";
import { useAuth } from "@/services/AuthContext";
import {
    isMentorshipEnabled,
    MENTORSHIP_EYEBROW,
    MENTORSHIP_GRADES,
    MENTORSHIP_INTRO,
    MentorshipGrade,
} from "@/config/mentorshipSupport";
import { MixpanelTracking } from "@/services/mixpanel";
import { MIXPANEL_EVENT } from "@/constants/config";

/**
 * Mentorship Support: how a Voucher / Blended Program student's mentor can
 * help them, by grade. Laid out to the program team's approved mockup.
 *
 * Reached from the homepage Resources tile. Programs without
 * `showMentorshipSupport` never see the tile, and a direct visit sends them
 * back home, so no other program gains this page.
 */
export default function MentorshipPage() {
    const { loggedIn, isLoading: authLoading, groupConfig } = useAuth();
    const router = useRouter();
    const enabled = isMentorshipEnabled(groupConfig);
    const [grade, setGrade] = useState<MentorshipGrade>(12);

    useEffect(() => {
        if (authLoading || !loggedIn) return;
        if (!enabled) {
            router.replace("/");
            return;
        }
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.MENTORSHIP_PAGE_VIEW, { page: "mentorship" });
    }, [authLoading, loggedIn, enabled, router]);

    if (authLoading || !loggedIn || !enabled) {
        return (
            <main className="max-w-xl mx-auto bg-white lg:max-w-none lg:bg-transparent">
                <TopBar />
                <Loading />
            </main>
        );
    }

    const selectGrade = (next: MentorshipGrade) => {
        setGrade(next);
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_MENTORSHIP_GRADE, { grade: next });
    };

    const content = MENTORSHIP_GRADES.find((entry) => entry.grade === grade) ?? MENTORSHIP_GRADES[0];

    return (
        <main className="max-w-xl mx-auto bg-white min-h-screen lg:max-w-none lg:bg-transparent">
            <TopBar />

            <div className="px-4 pt-4 pb-40 lg:mx-auto lg:max-w-6xl lg:px-10 lg:pt-7 lg:pb-16">
                <Link
                    href="/"
                    prefetch={false}
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary-dark mb-4"
                >
                    <span aria-hidden>←</span> Back to Resources
                </Link>

                <section className="bg-white border border-line rounded-xl p-4 lg:px-6 lg:py-5 mb-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-primary-dark">
                        {MENTORSHIP_EYEBROW}
                    </p>
                    <h2 className="text-[19px] lg:text-[22px] font-bold text-ink mt-2 mb-1.5">Mentorship Support</h2>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{MENTORSHIP_INTRO}</p>
                </section>

                <div className="flex items-center gap-3.5 font-bold text-ink mt-4 mb-3.5">
                    Choose your grade
                    <span aria-hidden className="flex-1 h-px bg-line" />
                </div>

                <div className="flex gap-2 lg:gap-3 mb-5" role="tablist" aria-label="Mentorship information by grade">
                    {MENTORSHIP_GRADES.map((entry) => {
                        const active = entry.grade === grade;
                        return (
                            <button
                                key={entry.grade}
                                type="button"
                                role="tab"
                                id={`grade${entry.grade}Tab`}
                                aria-selected={active}
                                aria-controls={`grade${entry.grade}`}
                                onClick={() => selectGrade(entry.grade)}
                                className={`flex-1 bg-white border rounded-[11px] px-2.5 py-3 lg:px-4 lg:py-4 flex items-center gap-2 lg:gap-3 text-left text-ink transition-colors ${active
                                    ? "border-primary ring-2 ring-primary/10"
                                    : "border-line hover:border-primary"
                                    }`}
                            >
                                <span className="hidden sm:flex w-9 h-9 flex-shrink-0 rounded-[10px] bg-primary-soft text-primary items-center justify-center font-semibold">
                                    {entry.grade}
                                </span>
                                <span>
                                    <strong className="block text-[12px] sm:text-sm">{entry.label}</strong>
                                    <small className="block text-[11px] sm:text-xs text-slate-500 mt-1">{entry.caption}</small>
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div role="tabpanel" id={`grade${content.grade}`} aria-labelledby={`grade${content.grade}Tab`}>
                    <section className="my-5">
                        <h3 className="text-base font-bold text-ink mb-3">How your mentor can help</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {content.help.map((item) => (
                                <article key={item.title} className="bg-white border border-line rounded-[10px] px-3.5 py-3 shadow-sm">
                                    <h4 className="text-[13px] font-bold text-ink mb-1.5">{item.title}</h4>
                                    <p className="text-xs text-slate-600 leading-normal">{item.body}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="my-5">
                        <h3 className="text-base font-bold text-ink mb-3">What to expect from your mentor</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {content.expect.map((item) => (
                                <li key={item.title} className="bg-primary-soft rounded-[9px] px-3.5 py-3 text-xs leading-normal text-ink">
                                    <strong className="block text-primary-dark mb-1">{item.title}</strong>
                                    {item.body}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>

            <BottomNavigationBar />
        </main>
    );
}
