"use client"

import { useEffect, useMemo, useState } from "react";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import Loading from "../loading";
import { useAuth } from "@/services/AuthContext";
import cutoffConfig from "@/config/cutoffConfig";
import {
    buildCutoffStatement,
    examsForStudent,
    findCutoffRow,
    findLatestScore,
    normalizeCutoffCategory,
} from "@/utils/cutoffUtils";
import { getReports } from "@/api/reporting/reports";
import { Report } from "../types";
import { formatDate } from "@/utils/dateUtils";
import { MixpanelTracking } from "@/services/mixpanel";
import { MIXPANEL_EVENT } from "@/constants/config";

const CARD = "bg-white border border-line rounded-xl p-3.5";
const CARD_LABEL = "text-[11px] font-semibold tracking-[0.07em] uppercase text-slate-500";

/**
 * Exam cutoffs, as a student reads them.
 *
 * Top to bottom: their own last score and what it means in one sentence, then
 * every category's marks in full, then what each target actually buys. The
 * internal M1 / M2 labels stay out of it — students see three named targets.
 *
 * Nothing here is picked by the student: the category comes off their record
 * and the exam from their stream. The exam switcher appears only when more than
 * one exam applies to them, which is why a single configured exam renders as a
 * plain page.
 */
export default function CutoffsPage() {
    const { loggedIn, userId, isLoading: authLoading, studentCategory, studentStream } = useAuth();

    const exams = useMemo(() => examsForStudent(cutoffConfig, studentStream), [studentStream]);
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    // Falls back to the first exam so a stale selection (or none yet) still
    // renders, instead of blanking the page.
    const exam = exams.find((entry) => entry.id === selectedExamId) ?? exams[0] ?? null;

    const [reports, setReports] = useState<Report[] | null>(null);

    const category = normalizeCutoffCategory(studentCategory);
    const row = exam ? findCutoffRow(exam, category) : null;

    // The reports list is not exam-scoped, so the latest scored attempt is the
    // latest of all of them. Fine while JEE Mains is the only exam with
    // cutoffs; a second exam will want the score filtered by test.
    const latestScore = useMemo(
        () => (exam ? findLatestScore(reports, exam.maxMarks) : null),
        [reports, exam]
    );

    const statement =
        exam && row && latestScore ? buildCutoffStatement(exam, row, latestScore.marks) : null;

    useEffect(() => {
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.CUTOFFS_PAGE_VIEW, { page: "cutoffs" });
    }, []);

    useEffect(() => {
        if (!loggedIn || !userId) return;
        let cancelled = false;

        async function fetchReports() {
            try {
                const data = await getReports(userId!);
                if (!cancelled) setReports(data?.reports ?? []);
            } catch (error) {
                // The cutoff tables are the substance of this page and need no
                // score, so a failed reports call costs the score card only.
                console.error("Error fetching reports for cutoffs:", error);
                if (!cancelled) setReports([]);
            }
        }

        fetchReports();
        return () => {
            cancelled = true;
        };
    }, [loggedIn, userId]);

    const selectExam = (examId: string) => {
        setSelectedExamId(examId);
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.SELECTED_EXAM_CUTOFF, { exam: examId });
    };

    if (authLoading || !loggedIn) {
        return (
            <main className="max-w-xl mx-auto bg-white lg:max-w-none lg:bg-transparent">
                <TopBar />
                <Loading />
            </main>
        );
    }

    const pageHeading = (
        <div className="bg-heading h-20 mb-4 lg:hidden">
            <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Exam Cutoffs</h1>
        </div>
    );

    if (!exam) {
        return (
            <main className="max-w-xl mx-auto bg-white min-h-screen lg:max-w-none lg:bg-transparent">
                <TopBar />
                {pageHeading}
                <div className="lg:mx-auto lg:max-w-6xl lg:px-10 lg:pt-8 lg:pb-16">
                    <p className="mx-5 text-slate-500 lg:mx-0">
                        Cutoffs for your exam aren&apos;t available yet.
                    </p>
                </div>
                <BottomNavigationBar />
            </main>
        );
    }

    return (
        <main className="max-w-xl mx-auto bg-white min-h-screen lg:max-w-none lg:bg-transparent">
            <TopBar />
            {pageHeading}

            <div className="px-5 pb-40 lg:mx-auto lg:max-w-6xl lg:px-10 lg:pt-8 lg:pb-16">
                {exams.length > 1 && (
                    <div className="flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Exam">
                        {exams.map((entry) => {
                            const active = entry.id === exam.id;
                            return (
                                <button
                                    key={entry.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => selectExam(entry.id)}
                                    className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${active
                                        ? "bg-primary border-primary text-white font-semibold"
                                        : "bg-white border-line text-ink hover:border-primary"
                                        }`}
                                >
                                    {entry.shortName}
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
                    {/* Score and statement are one block: the number, the test it
                        came from and what it means read straight down. Hidden
                        entirely until the reports API carries marks. */}
                    {latestScore && statement && (
                        <section className={`${CARD} lg:col-start-1 lg:row-start-1`}>
                            <p className={CARD_LABEL}>Your latest score</p>
                            <p className="flex items-baseline gap-2 mt-1.5">
                                <span className="text-[30px] font-bold text-ink tracking-tight tabular-nums leading-none">
                                    {latestScore.marks}
                                </span>
                                <span className="text-[13px] text-slate-500">/ {latestScore.totalMarks}</span>
                            </p>
                            <p className="text-[12.5px] text-slate-500 mt-1">
                                {latestScore.testName}
                                {latestScore.startDate ? ` · ${formatDate(latestScore.startDate)}` : ""}
                            </p>
                            <div className="bg-primary-soft rounded-b-[11px] -mx-3.5 -mb-3.5 mt-3.5 p-3.5 text-center">
                                <p className="text-[14.5px] font-semibold text-ink leading-snug">
                                    {statement.headline}
                                </p>
                                {statement.nextTarget && (
                                    <p className="text-[15.5px] font-bold text-ink leading-snug mt-2.5 pt-2.5 border-t border-ink/10">
                                        {statement.nextTarget}
                                    </p>
                                )}
                                <p className="text-[11.5px] text-slate-500 mt-2">{exam.sourceNote}</p>
                            </div>
                        </section>
                    )}

                    <section className={`${CARD} lg:col-start-2 lg:row-start-1`}>
                        <p className={CARD_LABEL}>All cutoffs · {exam.cycleLabel}</p>
                        <div className="overflow-x-auto mt-2.5">
                            <table className="w-full border-collapse text-[13px] tabular-nums">
                                <thead>
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-2 py-[7px] text-left text-[10px] font-semibold tracking-[0.05em] uppercase text-slate-500 border-b border-line"
                                        >
                                            Category
                                        </th>
                                        {exam.targets.map((target) => (
                                            <th
                                                key={target.key}
                                                scope="col"
                                                className="px-2 py-[7px] text-right text-[10px] font-semibold tracking-[0.05em] uppercase text-slate-500 border-b border-line"
                                            >
                                                {target.columnLabel}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {exam.cutoffs.map((cutoffRow, index) => {
                                        const isMine = cutoffRow.category === category;
                                        const isLast = index === exam.cutoffs.length - 1;
                                        const cellBorder = isLast ? "" : "border-b border-line";
                                        return (
                                            <tr key={cutoffRow.category} className={isMine ? "bg-primary-soft" : ""}>
                                                <th
                                                    scope="row"
                                                    className={`px-2 py-[7px] text-left font-semibold text-ink whitespace-nowrap ${cellBorder}`}
                                                >
                                                    {cutoffRow.category}
                                                    {isMine && (
                                                        <span className="text-primary text-[9.5px] font-bold tracking-[0.06em] ml-1">
                                                            you
                                                        </span>
                                                    )}
                                                </th>
                                                {exam.targets.map((target) => {
                                                    const mark = cutoffRow.marks[target.key];
                                                    return (
                                                        <td
                                                            key={target.key}
                                                            className={`px-2 py-[7px] text-right ${cellBorder} ${typeof mark === "number" ? "" : "text-slate-500"
                                                                }`}
                                                        >
                                                            {typeof mark === "number" ? mark : "—"}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-[11.5px] text-slate-500 mt-2.5 leading-snug">{exam.tableNote}</p>
                        {!category && (
                            <p className="text-[11.5px] text-slate-500 mt-1.5 leading-snug">
                                Your category isn&apos;t on your student record, so no row is marked as yours.
                            </p>
                        )}
                    </section>

                    {/* The wording in full, so a student who has never heard of a
                        tier can find out what a mark buys without asking anyone. */}
                    <section className={`${CARD} lg:col-start-1 lg:row-start-2`}>
                        <p className={CARD_LABEL}>What these mean</p>
                        {exam.targets.map((target, index) => (
                            <div
                                key={target.key}
                                className={`py-2.5 ${index === 0 ? "pt-2" : "border-t border-line"}`}
                            >
                                <b className="block text-sm font-semibold text-ink">{target.name}</b>
                                <p className="text-[12.5px] text-slate-500 mt-0.5 leading-snug">
                                    {target.description}
                                </p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>

            <BottomNavigationBar />
        </main>
    );
}
