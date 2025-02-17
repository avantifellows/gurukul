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
import { formatCurrentTime, formatSessionTime, formatQuizSessionTime, formatTime, isSessionActive, format12HrSessionTime } from "@/utils/dateUtils";
import { api } from "@/services/url";
import { MixpanelTracking } from "@/services/mixpanel";
import { getGroupConfig } from "@/config/groupConfig";

export default function Home() {
  const { loggedIn, userId, userDbId, group } = useAuth();
  const groupConfig = getGroupConfig(group || 'defaultGroup');
  const [liveClasses, setLiveClasses] = useState<SessionOccurrence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizSession[]>([]);
  const [quizCompletionStatus, setQuizCompletionStatus] = useState<QuizCompletionStatus>({});
  const commonTextClass = "text-gray-700 text-xs md:text-sm mx-3 md:mx-8 whitespace-nowrap w-12";
  const infoMessageClass = "flex items-center justify-center text-center h-72 mx-4 pb-40";
  const portalBaseUrl = api.portal.frontend.baseUrl;

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
      .filter(quiz => isSessionActive(formatQuizSessionTime(quiz.session.end_time)))
      .filter(quiz => isQuizAttemptable(quiz.session.platform_id));

    const regularTests = activeQuizzes.filter(quiz =>
      quiz.session.meta_data.test_type !== 'homework' &&
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

    return { nonChapterTests, chapterTests, practiceTests, homework };
  };

  const fetchUserSessions = async () => {
    try {
      const groupConfig = getGroupConfig(group || 'defaultGroup');
      const shouldFetchQuizzes = groupConfig.showTests || groupConfig.showPracticeTests || groupConfig.showHomework;

      const [liveSessionData, quizSessionData] = await Promise.all([
        groupConfig.showLiveClasses ? fetchUserSession(userDbId!) : Promise.resolve([]),
        shouldFetchQuizzes ? fetchUserSession(userDbId!, true) : Promise.resolve([])
      ]);

      const sessionIds = [...liveSessionData, ...quizSessionData].map(session => session.session_id);

      const sessionOccurrences = await getSessionOccurrences(sessionIds);

      const quizSessions = sessionOccurrences
        .filter((sessionOccurence: SessionOccurrence) => sessionOccurence.session.platform === 'quiz');
      setQuizzes(quizSessions);

      const liveSessions = sessionOccurrences
        .filter((sessionOccurence: SessionOccurrence) => sessionOccurence.session.platform === 'meet');
      setLiveClasses(liveSessions);

      MixpanelTracking.getInstance().identify(userId!);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
    }
  };


  const renderLiveClasses = () => {
    if (liveClasses.length === 0) {
      return <MessageDisplay message="No more live classes are scheduled for today!" />;
    }

    return (
      <div className="grid grid-cols-1 gap-4 pb-16">
        {liveClasses.map((data, index) => (
          isSessionActive(formatSessionTime(data.end_time)) && (
            <div key={index} className="flex mt-4 items-center">
              <div>
                <p className={commonTextClass}>
                  {format12HrSessionTime(data.start_time)}
                </p>
                <p className={commonTextClass}>
                  {format12HrSessionTime(data.end_time)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4 items-center">
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
          )
        ))}
        {liveClasses.filter((data) => isSessionActive(formatSessionTime(data.end_time))).length === 0 && (
          <MessageDisplay message="No more live classes are scheduled for today!" />
        )}
      </div>
    );
  };

  const renderTestSection = (title: string, tests: QuizSession[]) => {
    const shouldShow = (() => {
      switch (title.toLowerCase()) {
        case 'tests':
          return groupConfig.showTests;
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
          <h2 className="text-primary ml-4 font-semibold text-xl mt-6">{title}</h2>
          <MessageDisplay message="No more tests are scheduled for today!" />
        </div>
      );
    }
    if (tests.length === 0) return null;

    return (
      <div>
        <h2 className="text-primary ml-4 font-semibold text-xl mt-6">{title}</h2>
        <div className="grid grid-cols-1 gap-4 pb-4 mt-4">
          {tests.map((data, index) => (
            <div key={index} className="flex items-center">
              <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto min-h-[120px] py-3 relative w-full flex flex-row justify-between mx-4 items-center">
                <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`} />

                <div className="flex flex-col gap-1 pl-6 sm:w-full w-48 md:w-full text-sm md:text-base">
                  <div className="absolute top-2 left-6 text-gray-700 text-xs md:text-sm whitespace-nowrap">
                    {format12HrSessionTime(data.session.start_time)} - {format12HrSessionTime(data.session.end_time)}
                  </div>
                  <div className="font-semibold">
                    {data.session.name}
                  </div>
                  <div className="text-gray-600">
                    {data.session.meta_data.test_format}
                  </div>
                </div>

                <div className="flex items-center">
                  {renderButton(data.session)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  function renderButton(data: any) {
    const currentTime = new Date();
    const sessionStartTimeStr = formatSessionTime(data.start_time);
    const sessionEndTimeStr = formatSessionTime(data.end_time);
    const currentTimeStr = formatCurrentTime(currentTime.toISOString());

    const sessionTime = new Date(`2000-01-01T${sessionStartTimeStr}`);
    const sessionEndTime = new Date(`2000-01-01T${sessionEndTimeStr}`);
    const currentTimeObj = new Date(`2000-01-01T${currentTimeStr}`);
    const minutesUntilSessionStart = (sessionTime.getTime() - currentTimeObj.getTime()) / (1000 * 60);
    const hasSessionNotEnded = sessionEndTime.getTime() > currentTimeObj.getTime();

    if (data.session && data.session.platform === 'meet') {
      if (minutesUntilSessionStart <= 5 && hasSessionNotEnded) {
        return (
          <Link href={`${portalBaseUrl}/?sessionId=${data.session.session_id}`} target="_blank">
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
    } else if (data.platform === 'quiz') {
      if (minutesUntilSessionStart <= 5 && hasSessionNotEnded) {
        const isResumeable = quizCompletionStatus.hasOwnProperty(data.platform_id) && !quizCompletionStatus[data.platform_id];
        const formatType = data.meta_data?.gurukul_format_type || 'both';
        const showBothButtons = formatType === 'both';

        const renderQuizButton = formatType !== 'omr' ? (
          <div className="flex flex-col items-center">
            <Link href={`${portalBaseUrl}/?sessionId=${data.session_id}`} target="_blank">
              <PrimaryButton className={`${isResumeable ? "bg-resumeable" : "bg-primary"} text-white text-sm rounded-md w-[118px] md:w-36 h-8 shadow-slate-400`}>
                {isResumeable ? "Resume" : "Start Test"}
              </PrimaryButton>
            </Link>
            <div className={`text-gray-500 md:text-xs text-[10px] text-center ${showBothButtons ? 'pb-2' : ''}`}>Click to begin online test</div>
          </div>
        ) : null;

        const renderOmrButton = formatType !== 'qa' ? (
          <div className="flex flex-col items-center">
            <Link href={`${portalBaseUrl}/?sessionId=${data.session_id}&omrMode=true`} target="_blank">
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
          <p className="text-xs italic font-normal mr-4 w-12">
            Starts at <br />
            {format12HrSessionTime(data.start_time)}
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
    if (loggedIn) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          if (userDbId !== null) {
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
  }, [loggedIn, userDbId]);

  const { nonChapterTests, chapterTests, practiceTests, homework } = filterAndSortTests(quizzes);

  return (
    <>
      {isLoading ? (
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
            {groupConfig.showTests && renderTestSection("Tests", [...nonChapterTests, ...chapterTests])}
            {groupConfig.showPracticeTests && renderTestSection("Practice Tests", practiceTests)}
            {groupConfig.showHomework && renderTestSection("Homework", homework)}
          </div>
          <BottomNavigationBar />
        </main>
      )}
    </>
  );
}
