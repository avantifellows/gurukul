"use client"

import { useAuth } from "@/services/AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { getSessionOccurrences, fetchUserSession } from "@/api/afdb/session";
import { useState, useEffect } from "react";
import { QuizSession, SessionOccurrence, MessageDisplayProps, Session, QuizCompletionStatus } from "./types";
import Link from "next/link";
import PrimaryButton from "@/components/Button";
import Loading from "./loading";
import { formatSessionTime, formatTime, isSessionActive, minutesUntilStart, format12HrSessionTime, formatSessionTimeRange } from "@/utils/dateUtils";
import { MixpanelTracking } from "@/services/mixpanel";
import { IoIosArrowDown as ExpandIcon, IoIosArrowUp as CollapseIcon } from 'react-icons/io';
import { buildGurukulSessionUrl } from "@/utils/portalLinks";

export default function Home() {
  const { loggedIn, userId, groupConfig, isLoading: authLoading } = useAuth();
  const [liveClasses, setLiveClasses] = useState<SessionOccurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizSession[]>([]);
  const [quizCompletionStatus, setQuizCompletionStatus] = useState<QuizCompletionStatus>({});
  const [dataFetched, setDataFetched] = useState(false);
  const commonTextClass = "text-gray-700 text-xs md:text-sm mx-3 md:mx-8 whitespace-nowrap w-12 tnum lg:mx-0 lg:w-auto lg:text-sm";
  const infoMessageClass = "flex items-center justify-center text-center h-72 mx-4 pb-40 lg:h-auto lg:py-10 lg:mx-0 lg:pb-0 lg:justify-start lg:text-left lg:text-slate-500";

  // Accordion state for Practice Test Accordion UI
  const [expandedFormat, setExpandedFormat] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchQuizCompletionStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_QUIZ_BACKEND_URL}sessions/user/${userId}/quiz-attempts`);
      const data = await response.json();
      setQuizCompletionStatus(data);
    } catch (error) {
      console.error("Error fetching quiz completion status:", error);
    }
  };

  const isQuizAttemptable = (platformId: string) => {
    return !quizCompletionStatus.hasOwnProperty(platformId) ||
      quizCompletionStatus[platformId] === false;
  };

  /**
 * Filters and sorts quizzes into different categories such as non-chapter tests,
 * chapter tests, practice tests, and homework. This method is essential for the Gurukul
 * platform to categorize and display tests efficiently, allowing users to quickly identify
 * the type of tests they need to attempt based on their purpose (e.g., chapter tests or practice tests).
 * The separation ensures a clear structure in the UI, enhancing user experience by organizing
 * tests by relevance.
 */
  const filterAndSortTests = (quizzes: QuizSession[]) => {
    const activeQuizzes = quizzes
      // Use the OCCURRENCE end (top-level end_time), not session.end_time. For a
      // weekly session, session.end_time is the multi-day schedule span end, while
      // the occurrence end_time is *today's* slot (e.g. 11am–1pm) — so an 11–1
      // weekly correctly disappears after 1pm. For a continuous session the two
      // coincide (one 24h window), so it stays visible across midnight.
      .filter(quiz => isSessionActive(quiz.end_time ?? quiz.session.end_time))
      .filter(quiz => {
        const platformId = quiz.session.platform_id;
        const isCompleted = quizCompletionStatus[platformId] === true;
        return isQuizAttemptable(platformId) || isCompleted;
      });

    // Forms (e.g. feedback questionnaires) ride on the quiz platform with
    // test_type 'form'; they get their own section above the test sections.
    const forms = activeQuizzes.filter(quiz =>
      quiz.session.meta_data.test_type === 'form'
    );

    // Chapter tests are deliberately NOT split out — they render in the same
    // Tests section as every other regular test.
    const tests = activeQuizzes.filter(quiz =>
      quiz.session.meta_data.test_type !== 'homework' &&
      quiz.session.meta_data.test_type !== 'form' &&
      quiz.session.meta_data.test_purpose !== 'practice_test'
    );

    const practiceTests = activeQuizzes.filter(quiz =>
      quiz.session.meta_data.test_purpose === 'practice_test'
    );

    const homework = activeQuizzes.filter(quiz =>
      quiz.session.meta_data.test_type === 'homework'
    );

    return { forms, tests, practiceTests, homework };
  };

  const fetchUserSessions = async () => {
    setIsLoading(true);
    try {
      const shouldFetchQuizzes = groupConfig.showTests || groupConfig.showForms || groupConfig.showPracticeTests || groupConfig.showHomework;

      const numericUserId = Number(userId);

      const [liveSessionData, quizSessionData] = await Promise.all([
        groupConfig.showLiveClasses ? fetchUserSession(numericUserId) : Promise.resolve([]),
        shouldFetchQuizzes ? fetchUserSession(numericUserId, true) : Promise.resolve([])
      ]);

      const sessionIds = [...liveSessionData, ...quizSessionData].map(session => session.session_id);

      // Added Guard Clause to avoid fetching session occurrences if there are no sessions
      if (sessionIds.length === 0) {
        setQuizzes([]);
        setLiveClasses([]);
        return;
      }

      const sessionOccurrences = await getSessionOccurrences(sessionIds);

      const quizSessions = sessionOccurrences.filter((sessionOccurence: SessionOccurrence) => sessionOccurence.session.platform === 'quiz');
      setQuizzes(quizSessions);

      const liveSessions = sessionOccurrences.filter((sessionOccurence: SessionOccurrence) => sessionOccurence.session.platform === 'meet');
      setLiveClasses(liveSessions);

      MixpanelTracking.getInstance().identify(userId!);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
    } finally {
      setIsLoading(false);
      setDataFetched(true);
    }
  };

  /**
   * Section label. On a phone it is a plain teal heading; on desktop it becomes
   * a quieter label with a rule running out to the right, so several sections
   * stacked in one wide column stay visually separable.
   */
  function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex items-baseline gap-4 pt-6 lg:pt-10 lg:pb-1">
        <h2 className="text-primary ml-4 font-semibold text-xl lg:ml-0 lg:text-ink lg:text-base">
          {children}
        </h2>
        <span aria-hidden className="hidden lg:block flex-1 h-px bg-line" />
      </div>
    );
  }

  /**
   * Wraps a run of session rows. On desktop it draws the hairline the time
   * gutter hangs off, so the day reads top-to-bottom as a schedule.
   */
  function Schedule({ children }: { children: React.ReactNode }) {
    return (
      <div className="relative lg:pt-3">
        <span aria-hidden className="hidden lg:block absolute left-[7.25rem] top-0 bottom-0 w-px bg-line" />
        {children}
      </div>
    );
  }

  /** The start/end pair that sits in the desktop time gutter. */
  function TimeGutter({ start, end }: { start: string; end: string }) {
    return (
      <div className="hidden lg:flex w-[7.25rem] shrink-0 flex-col items-end pr-4 pt-4 text-sm leading-tight tnum">
        <span className="font-medium text-ink">{format12HrSessionTime(start)}</span>
        <span className="text-slate-500">{format12HrSessionTime(end)}</span>
      </div>
    );
  }

  /**
   * One test / form / homework row. Shared by the plain sections and the
   * practice-test accordion so both stay in step.
   */
  function TestRow({ data, index, formatLabel, inset = true }: { data: QuizSession; index: number; formatLabel?: string; inset?: boolean }) {
    const start = data.start_time ?? data.session.start_time;
    const end = data.end_time ?? data.session.end_time;

    return (
      <div className="flex items-center mt-4 lg:mt-0 lg:mb-3 lg:items-start">
        <TimeGutter start={start} end={end} />
        <div className={`bg-white rounded-lg shadow-lg min-h-24 h-auto min-h-[120px] py-3 relative w-full flex flex-row justify-between ${inset ? "mx-4" : ""} items-center lg:mx-0 lg:ml-5 lg:min-h-0 lg:py-4 lg:pr-4 lg:rounded-xl lg:shadow-none lg:border lg:border-line`}>
          <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md lg:rounded-s-xl`} />

          <div className="flex flex-col gap-1 pl-6 sm:w-full w-48 md:w-full text-sm md:text-base lg:pl-7">
            <div className="absolute top-2 left-6 text-gray-700 text-xs md:text-sm whitespace-nowrap lg:hidden">
              {formatSessionTimeRange(start, end)}
            </div>
            <div className="font-semibold lg:text-[15px] lg:text-ink">
              {data.session.name}
            </div>
            <div className="text-gray-600 lg:text-sm">
              {formatLabel ?? data.session.meta_data.test_format}
            </div>
          </div>

          <div className="flex items-center shrink-0">
            {renderButton(data)}
          </div>
        </div>
      </div>
    );
  }

  const renderLiveClasses = () => {
    if (isLoading) return null;

    if (!dataFetched) return null;

    if (liveClasses.length === 0) {
      return <MessageDisplay message="No more live classes are scheduled for today!" />;
    }

    const activeLiveClasses = liveClasses.filter((data) => isSessionActive(data.end_time));

    if (activeLiveClasses.length === 0) {
      return <MessageDisplay message="No more live classes are scheduled for today!" />;
    }

    return (
      <Schedule>
        <div className="grid grid-cols-1 gap-4 pb-16 lg:gap-0 lg:pb-0">
          {activeLiveClasses.map((data, index) => (
            <div key={index} className="flex mt-4 items-center lg:mt-0 lg:mb-3 lg:items-start">
              <div className="lg:w-[7.25rem] lg:shrink-0 lg:flex lg:flex-col lg:items-end lg:pr-4 lg:pt-4 lg:leading-tight">
                <p className={`${commonTextClass} lg:font-medium lg:text-ink`}>
                  {format12HrSessionTime(data.start_time)}
                </p>
                <p className={`${commonTextClass} lg:text-slate-500`}>
                  {format12HrSessionTime(data.end_time)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4 md:mr-8 items-center lg:mr-0 lg:ml-5 lg:min-h-0 lg:py-4 lg:rounded-xl lg:shadow-none lg:border lg:border-line">
                <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md lg:rounded-s-xl`}></div>
                <div className="text-sm md:text-base mx-6 md:mx-8 w-32 md:w-72 lg:mx-0 lg:pl-7 lg:w-auto lg:flex-1">
                  <span className="font-semibold">{data.session.meta_data.subject ?? "Science"}</span>
                  <div className="text-sm md:text-base break-words lg:text-slate-600">
                    {data.session.name}
                  </div>
                </div>
                {renderButton(data)}
              </div>
            </div>
          ))}
        </div>
      </Schedule>
    );
  };

  const renderTestSection = (title: string, tests: QuizSession[]) => {
    if (isLoading) return null;

    if (!dataFetched) return null;

    const shouldShow = (() => {
      switch (title.toLowerCase()) {
        case 'tests':
          return groupConfig.showTests;
        case 'forms':
          return groupConfig.showForms;
        case 'practice tests':
          return groupConfig.showPracticeTests;
        case 'homework':
          return groupConfig.showHomework;
        default:
          return true;
      }
    })();

    if (!shouldShow) return null;

    if (tests.length === 0) {
      return (
        <div>
          <SectionHeading>{title}</SectionHeading>
          {groupConfig.noTestsMessage ? (
            <div className="flex flex-col items-center justify-center text-center h-72 pb-40 lg:h-auto lg:items-start lg:text-left lg:py-10 lg:pb-0">
              <p className="text-center lg:text-left lg:text-slate-500">{groupConfig.noTestsMessage}</p>
              {groupConfig.testsInfoLink && (
                <p>
                  <a href={groupConfig.testsInfoLink} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">Check your test calendar here</a>
                </p>
              )}
            </div>
          ) : (
            <MessageDisplay message="No more tests are scheduled for today!" />
          )}
        </div>
      );
    }

    return (
      <div>
        <SectionHeading>{title}</SectionHeading>
        {/* {groupConfig.testsHeaderNote && (
          <p className="mx-4 mt-2 text-gray-700 text-sm">{groupConfig.testsHeaderNote}</p>
        )} */}
        <Schedule>
          <div className="grid grid-cols-1 gap-4 pb-4 lg:gap-0 lg:pb-0">
            {tests.map((data, index) => (
              <TestRow key={index} data={data} index={index} />
            ))}
          </div>
        </Schedule>
      </div>
    );
  };

  function renderButton(data: any) {
    // Callers pass an occurrence ({ end_time, session }) for live classes and the
    // bare session for quizzes. Normalise: `occurrence` is whichever carries the
    // occurrence-level end_time, `session` is always the session fields.
    const occurrence = data;
    const session = data.session ?? data;

    const occurrenceStart = occurrence.start_time ?? session.start_time;
    const sessionStartTimeStr = formatSessionTime(occurrenceStart);

    // Both date-aware (full timestamps), so a continuous / overnight window that
    // opened on a PREVIOUS day still reads as already-started (negative) and not
    // yet ended. Time-of-day-only math wrongly showed "Starts at…" the morning
    // after. See minutesUntilStart / isSessionActive in utils/dateUtils.
    const minutesUntilSessionStart = minutesUntilStart(occurrenceStart);
    const hasSessionNotEnded = isSessionActive(occurrence.end_time ?? session.end_time);

    if (data.session && data.session.platform === 'meet') {
      if (minutesUntilSessionStart <= 5 && hasSessionNotEnded) {
        return (
          <Link href={buildGurukulSessionUrl(data.session.session_id)} target="_blank">
            <PrimaryButton className="bg-primary text-white text-sm rounded-md w-14 h-8 mr-4 shadow-md shadow-slate-400 lg:shadow-none lg:w-20 lg:font-medium lg:hover:bg-primary-dark lg:transition-colors">
              JOIN
            </PrimaryButton>
          </Link>
        );
      } else {
        return (
          <p className="text-xs italic font-normal mr-4 lg:not-italic lg:text-slate-500">
            Starts at <br />
            {formatTime(sessionStartTimeStr)}
          </p>
        );
      }
    } else if (session.platform === 'quiz') {
      // Forms (feedback questionnaires etc.) run on the quiz platform too;
      // only the copy differs.
      const isForm = session.meta_data?.test_type === 'form';
      const isCompleted = quizCompletionStatus.hasOwnProperty(session.platform_id) && quizCompletionStatus[session.platform_id] === true;
      if (isCompleted) {
        return (
          <div className="flex flex-col items-center pr-2 lg:pr-0">
            <div className="w-[118px] italic md:w-36 h-8 flex items-center justify-center text-xs lg:not-italic lg:text-slate-500 lg:justify-end lg:w-auto lg:pl-4">
              {isForm ? "Form Submitted" : "Test Submitted"}
            </div>
          </div>
        );
      }
      if (minutesUntilSessionStart <= 5 && hasSessionNotEnded) {
        const isResumeable = quizCompletionStatus.hasOwnProperty(session.platform_id) && !quizCompletionStatus[session.platform_id];
        // Forms have no OMR variant, so they are always 'qa' regardless of
        // gurukul_format_type metadata (which is sometimes missing anyway).
        const formatType = isForm ? 'qa' : (session.meta_data?.gurukul_format_type || 'both');
        const showBothButtons = formatType === 'both';

        const renderQuizButton = formatType !== 'omr' ? (
          <div className="flex flex-col items-center">
            <Link href={buildGurukulSessionUrl(session.session_id)} target="_blank">
              <PrimaryButton className={`${isResumeable ? "bg-resumeable" : "bg-primary"} text-white text-sm rounded-md w-[118px] md:w-36 h-8 shadow-slate-400 lg:font-medium lg:transition-opacity lg:hover:opacity-90`}>
                {isResumeable ? "Resume" : (isForm ? "Fill Form" : "Start Test")}
              </PrimaryButton>
            </Link>
            <div className={`text-gray-500 md:text-xs text-[10px] text-center ${showBothButtons ? 'pb-2' : ''}`}>{isForm ? "Click to fill the form" : "Click to begin online test"}</div>
          </div>
        ) : null;

        const renderOmrButton = formatType !== 'qa' ? (
          <div className="flex flex-col items-center">
            <Link href={buildGurukulSessionUrl(session.session_id, { omrMode: true })} target="_blank">
              <PrimaryButton className={`${isResumeable ? "bg-resumeable" : "bg-primary"} text-white text-sm rounded-md w-[118px] md:w-36 h-8 shadow-slate-400 lg:font-medium lg:transition-opacity lg:hover:opacity-90`}>
                {isResumeable ? "Resume" : "Fill OMR"}
              </PrimaryButton>
            </Link>
            <div className="text-gray-500 md:text-xs text-[10px] text-center">Click for offline test</div>
          </div>
        ) : null;

        return (
          <div className="flex flex-col pr-2 lg:pr-0 lg:pl-4">
            {renderQuizButton}
            {renderOmrButton}
          </div>
        );
      } else {
        return (
          <p className="text-xs italic font-normal mr-4 w-14 lg:not-italic lg:mr-0 lg:w-auto lg:pl-4 lg:text-right lg:text-slate-500">
            Starts at <br />
            {format12HrSessionTime(occurrence.start_time ?? session.start_time)}
          </p>
        );
      }
    }
    return null;
  }

  function MessageDisplay({ message }: MessageDisplayProps) {
    return <p className={infoMessageClass}>{message}</p>;
  }

  useEffect(() => {
    if (loggedIn && !authLoading) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          if (userId && !Number.isNaN(Number(userId))) {
            await Promise.all([
              fetchUserSessions(),
              fetchQuizCompletionStatus()
            ]);
          }
        } catch (error) {
          console.log("Error:", error);
        }
        setIsLoading(false);
      };
      fetchData();
    }
  }, [loggedIn, userId, authLoading]);

  const { forms, tests, practiceTests, homework } = filterAndSortTests(quizzes);

  // --- Practice Test Accordion UI for all groups ---
  // Filter and group practice tests by format
  const allowedFormats = [
    'part_test',
    'major_test',
    'full_syllabus_test',
    'mock_test',
  ];
  const formatOrder = [
    'part_test',
    'major_test',
    'full_syllabus_test',
    'mock_test',
  ];
  const formatDisplayNames: { [key: string]: string } = {
    part_test: 'Part Test',
    major_test: 'Major Test',
    full_syllabus_test: 'Full Syllabus Test',
    mock_test: 'Mock Test',
  };
  // Group tests by format
  const groupedPracticeTests: { [format: string]: QuizSession[] } = {};
  practiceTests.forEach((test) => {
    const format = test.session.meta_data.test_format;
    if (allowedFormats.includes(format)) {
      if (!groupedPracticeTests[format]) groupedPracticeTests[format] = [];
      groupedPracticeTests[format].push(test);
    }
  });
  const handleAccordionToggle = (format: string) => {
    setExpandedFormat(expandedFormat === format ? null : format);
  };

  return (
    <>
      {(isLoading || authLoading) ? (
        <div className="max-w-xl mx-auto lg:max-w-none">
          <TopBar />
          <Loading />
        </div>
      ) : (
        <main className="min-h-screen max-w-xl mx-auto md:mx-auto bg-heading lg:max-w-none lg:bg-transparent">
          <TopBar />
          {/* Below `lg` this is a no-op and the phone column is unchanged;
              above it, the day sits in one left-aligned reading column. */}
          <div className="lg:mx-auto lg:max-w-6xl lg:px-10 lg:pb-16">
            {groupConfig.showLiveClasses && (
              <div>
                <SectionHeading>Live Classes</SectionHeading>
                {renderLiveClasses()}
              </div>
            )}

            <div className="pb-40 lg:pb-0">
              {/* Only rendered when there are active forms — no empty-state
                  message, so students never see "no more forms" on a normal day. */}
              {groupConfig.showForms && forms.length > 0 && renderTestSection("Forms", forms)}
              {groupConfig.showTests && renderTestSection(groupConfig.testsSectionTitle || "Tests", tests)}
              {/* Practice Tests Accordion for all groups */}
              {groupConfig.showPracticeTests && (
                <div>
                  <SectionHeading>Practice Tests</SectionHeading>
                  <div className="mt-4 lg:mt-3">
                    {formatOrder.map((format) => (
                      groupedPracticeTests[format] && groupedPracticeTests[format].length > 0 && (
                        <div key={format} className="mx-5 mb-4 lg:mx-0 lg:mb-3">
                          <button
                            type="button"
                            aria-expanded={expandedFormat === format}
                            className={`w-full text-md font-semibold bg-primary text-white cursor-pointer px-4 py-4 flex flex-row justify-between items-center text-left lg:rounded-lg lg:py-3 lg:text-[15px] lg:transition-colors ${expandedFormat === format
                              ? 'lg:bg-primary lg:text-white'
                              : 'lg:bg-white lg:text-ink lg:border lg:border-line lg:hover:border-primary'}`}
                            onClick={() => handleAccordionToggle(format)}
                          >
                            <div>{formatDisplayNames[format] || format}</div>
                            <div className="w-8 flex justify-center">
                              {expandedFormat === format ? (
                                <CollapseIcon className="w-6 h-6" />
                              ) : (
                                <ExpandIcon className="w-6 h-6" />
                              )}
                            </div>
                          </button>
                          {expandedFormat === format && (
                            <Schedule>
                              {groupedPracticeTests[format].map((test, idx) => (
                                <TestRow
                                  key={test.session.platform_id}
                                  data={test}
                                  index={idx}
                                  inset={false}
                                  formatLabel={formatDisplayNames[test.session.meta_data.test_format] || test.session.meta_data.test_format}
                                />
                              ))}
                            </Schedule>
                          )}
                        </div>
                      )
                    ))}
                    {/* If no tests at all, show message */}
                    {formatOrder.every(format => !groupedPracticeTests[format] || groupedPracticeTests[format].length === 0) && (
                      <MessageDisplay message="No Practice Tests available!" />
                    )}
                  </div>
                </div>
              )}
              {groupConfig.showHomework && renderTestSection("Homework", homework)}
            </div>
          </div>
          <BottomNavigationBar />
        </main>
      )}
    </>
  );
}
