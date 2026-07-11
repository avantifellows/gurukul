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
  const commonTextClass = "text-gray-700 text-xs md:text-sm mx-3 md:mx-8 whitespace-nowrap w-12";
  const infoMessageClass = "flex items-center justify-center text-center h-72 mx-4 pb-40";

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

    const regularTests = activeQuizzes.filter(quiz =>
      quiz.session.meta_data.test_type !== 'homework' &&
      quiz.session.meta_data.test_type !== 'form' &&
      quiz.session.meta_data.test_purpose !== 'practice_test'
    );

    const nonChapterTests = regularTests.filter(quiz =>
      quiz.session.meta_data.test_format !== 'chapter_test'
    );

    const chapterTests = regularTests.filter(quiz =>
      quiz.session.meta_data.test_format === 'chapter_test'
    );

    const practiceTests = activeQuizzes.filter(quiz =>
      quiz.session.meta_data.test_purpose === 'practice_test'
    );

    const homework = activeQuizzes.filter(quiz =>
      quiz.session.meta_data.test_type === 'homework'
    );

    return { forms, nonChapterTests, chapterTests, practiceTests, homework };
  };

  const fetchUserSessions = async () => {
    setIsLoading(true);
    try {
      const shouldFetchQuizzes = groupConfig.showTests || groupConfig.showPracticeTests || groupConfig.showHomework;

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
      <div className="grid grid-cols-1 gap-4 pb-16">
        {activeLiveClasses.map((data, index) => (
          <div key={index} className="flex mt-4 items-center">
            <div>
              <p className={commonTextClass}>
                {format12HrSessionTime(data.start_time)}
              </p>
              <p className={commonTextClass}>
                {format12HrSessionTime(data.end_time)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4 md:mr-8 items-center">
              <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`}></div>
              <div className="text-sm md:text-base mx-6 md:mx-8 w-32 md:w-72">
                <span className="font-semibold">{data.session.meta_data.subject ?? "Science"}</span>
                <div className="text-sm md:text-base break-words">
                  {data.session.name}
                </div>
              </div>
              {renderButton(data)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTestSection = (title: string, tests: QuizSession[]) => {
    if (isLoading) return null;

    if (!dataFetched) return null;

    const shouldShow = (() => {
      switch (title.toLowerCase()) {
        case 'tests':
          return groupConfig.showTests;
        case 'chapter tests':
          return groupConfig.showChapterTests;
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
      // noTestsMessage is worded for the main live-test section (e.g. "There is
      // no NVS live test for today!"), so don't reuse it under Chapter Tests.
      const isChapterTestSection = title.toLowerCase() === 'chapter tests';
      if (isChapterTestSection) {
        return (
          <div>
            <h2 className="text-primary ml-4 font-semibold text-xl mt-6">{title}</h2>
            <MessageDisplay message="No more chapter tests are scheduled for today!" />
          </div>
        );
      }
      return (
        <div>
          <h2 className="text-primary ml-4 font-semibold text-xl mt-6">{title}</h2>
          {groupConfig.noTestsMessage ? (
            <div className="flex flex-col items-center justify-center text-center h-72 pb-40">
              <p className="text-center">{groupConfig.noTestsMessage}</p>
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
        <h2 className="text-primary ml-4 font-semibold text-xl mt-6">{title}</h2>
        {/* {groupConfig.testsHeaderNote && (
          <p className="mx-4 mt-2 text-gray-700 text-sm">{groupConfig.testsHeaderNote}</p>
        )} */}
        <div className="grid grid-cols-1 gap-4 pb-4">
          {tests.map((data, index) => (
            <div key={index} className="flex items-center mt-4">
              <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto min-h-[120px] py-3 relative w-full flex flex-row justify-between mx-4 items-center">
                <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`} />

                <div className="flex flex-col gap-1 pl-6 sm:w-full w-48 md:w-full text-sm md:text-base">
                  <div className="absolute top-2 left-6 text-gray-700 text-xs md:text-sm whitespace-nowrap">
                    {formatSessionTimeRange(data.start_time ?? data.session.start_time, data.end_time ?? data.session.end_time)}
                  </div>
                  <div className="font-semibold">
                    {data.session.name}
                  </div>
                  <div className="text-gray-600">
                    {data.session.meta_data.test_format}
                  </div>
                </div>

                <div className="flex items-center">
                  {renderButton(data)}
                </div>
              </div>
            </div>
          ))}
        </div>
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
            <PrimaryButton className="bg-primary text-white text-sm rounded-md w-14 h-8 mr-4 shadow-md shadow-slate-400">
              JOIN
            </PrimaryButton>
          </Link>
        );
      } else {
        return (
          <p className="text-xs italic font-normal mr-4">
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
          <div className="flex flex-col items-center pr-2">
            <div className="w-[118px] italic md:w-36 h-8 flex items-center justify-center text-xs">
              {isForm ? "Form Submitted" : "Test Submitted"}
            </div>
          </div>
        );
      }
      if (minutesUntilSessionStart <= 5 && hasSessionNotEnded) {
        const isResumeable = quizCompletionStatus.hasOwnProperty(session.platform_id) && !quizCompletionStatus[session.platform_id];
        const formatType = session.meta_data?.gurukul_format_type || 'both';
        const showBothButtons = formatType === 'both';

        const renderQuizButton = formatType !== 'omr' ? (
          <div className="flex flex-col items-center">
            <Link href={buildGurukulSessionUrl(session.session_id)} target="_blank">
              <PrimaryButton className={`${isResumeable ? "bg-resumeable" : "bg-primary"} text-white text-sm rounded-md w-[118px] md:w-36 h-8 shadow-slate-400`}>
                {isResumeable ? "Resume" : (isForm ? "Fill Form" : "Start Test")}
              </PrimaryButton>
            </Link>
            <div className={`text-gray-500 md:text-xs text-[10px] text-center ${showBothButtons ? 'pb-2' : ''}`}>{isForm ? "Click to fill the form" : "Click to begin online test"}</div>
          </div>
        ) : null;

        const renderOmrButton = formatType !== 'qa' ? (
          <div className="flex flex-col items-center">
            <Link href={buildGurukulSessionUrl(session.session_id, { omrMode: true })} target="_blank">
              <PrimaryButton className={`${isResumeable ? "bg-resumeable" : "bg-primary"} text-white text-sm rounded-md w-[118px] md:w-36 h-8 shadow-slate-400`}>
                {isResumeable ? "Resume" : "Fill OMR"}
              </PrimaryButton>
            </Link>
            <div className="text-gray-500 md:text-xs text-[10px] text-center">Click for offline test</div>
          </div>
        ) : null;

        return (
          <div className="flex flex-col pr-2">
            {renderQuizButton}
            {renderOmrButton}
          </div>
        );
      } else {
        return (
          <p className="text-xs italic font-normal mr-4 w-14">
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

  const { forms, nonChapterTests, chapterTests, practiceTests, homework } = filterAndSortTests(quizzes);

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
        <div className="max-w-xl mx-auto">
          <TopBar />
          <Loading />
        </div>
      ) : (
        <main className="min-h-screen max-w-xl mx-auto md:mx-auto bg-heading">
          <TopBar />
          {groupConfig.showLiveClasses && (
            <div>
              <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Live Classes</h1>
              {renderLiveClasses()}
            </div>
          )}

          <div className="pb-40">
            {/* Only rendered when there are active forms — no empty-state
                message, so students never see "no more forms" on a normal day. */}
            {forms.length > 0 && renderTestSection("Forms", forms)}
            {groupConfig.showTests && renderTestSection(groupConfig.testsSectionTitle || "Tests", nonChapterTests)}
            {groupConfig.showChapterTests && renderTestSection("Chapter Tests", chapterTests)}
            {/* Practice Tests Accordion for all groups */}
            {groupConfig.showPracticeTests && (
              <div>
                <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Practice Tests</h1>
                <div className="mt-4">
                  {formatOrder.map((format) => (
                    groupedPracticeTests[format] && groupedPracticeTests[format].length > 0 && (
                      <div key={format} className="mx-5 mb-4">
                        <div
                          className="text-md font-semibold bg-primary text-white cursor-pointer px-4 py-4 flex flex-row justify-between items-center"
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
                        </div>
                        {expandedFormat === format && (
                          <div>
                            {groupedPracticeTests[format].map((test, idx) => (
                              <div key={test.session.platform_id} className="flex items-center mt-4">
                                <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto min-h-[120px] py-3 relative w-full flex flex-row justify-between items-center">
                                  <div className={`${idx % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`} />
                                  <div className="flex flex-col gap-1 pl-6 sm:w-full w-48 md:w-full text-sm md:text-base">
                                    <div className="absolute top-2 left-6 text-gray-700 text-xs md:text-sm whitespace-nowrap">
                                      {formatSessionTimeRange(test.start_time ?? test.session.start_time, test.end_time ?? test.session.end_time)}
                                    </div>
                                    <div className="font-semibold">
                                      {test.session.name}
                                    </div>
                                    <div className="text-gray-600">
                                      {formatDisplayNames[test.session.meta_data.test_format] || test.session.meta_data.test_format}
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    {renderButton(test)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
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
          <BottomNavigationBar />
        </main>
      )}
    </>
  );
}
