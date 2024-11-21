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

export default function Home() {
  const { loggedIn, userId, userDbId } = useAuth();
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
      const [liveSessionData, quizSessionData] = await Promise.all([
        fetchUserSession(userDbId!),
        fetchUserSession(userDbId!, true)
      ]);

      const quizData = await Promise.all(quizSessionData.map(async (quiz: Session) => {
        const sessionOccurrenceData = await getSessionOccurrences(quiz.session_id);
        if (!sessionOccurrenceData) return null;
        return sessionOccurrenceData;
      }));
      const flattenedQuizData = quizData.flat();
      const quizSessions = flattenedQuizData.filter(flattenedSessionsData => flattenedSessionsData.session.platform === 'quiz');
      setQuizzes(quizSessions);

      const sessionsData = await Promise.all(liveSessionData.map(async (liveSession: Session) => {
        const sessionOccurrenceData = await getSessionOccurrences(liveSession.session_id);
        if (!sessionOccurrenceData) return null;
        return sessionOccurrenceData;
      }));
      const flattenedSessionsData = sessionsData.flat();
      const liveSessions = flattenedSessionsData.filter(flattenedSessionsData => flattenedSessionsData.session.platform === 'meet');

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
                <div className="text-sm md:text-base mx-6 md:mx-8 w-36">
                  <span className="font-semibold">{data.session.meta_data.subject ?? "Science"} </span>
                  <div className="text-sm md:text-base">
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
        <div className="grid grid-cols-1 gap-4 pb-4">
          {tests.map((data, index) => (
            <div key={index} className="flex mt-4 items-center">
              <div>
                <p className={commonTextClass}>
                  {format12HrSessionTime(data.session.start_time)}
                </p>
                <p className={commonTextClass}>
                  {format12HrSessionTime(data.session.end_time)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4 items-center">
                <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`}></div>
                <div className="text-sm md:text-base mx-6 md:mx-8">
                  <div className="flex w-36 md:w-full">
                    <span className="font-semibold">{data.session.name}</span>
                  </div>
                  <div className="text-sm md:text-base">
                    <span>{data.session.meta_data.test_format}</span>
                  </div>
                </div>
                {renderButton(data.session)}
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
            <PrimaryButton className="bg-primary text-white text-sm rounded-lg w-12 h-8 mr-4 shadow-md shadow-slate-400">
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
        const buttonText = isResumeable ? "RESUME" : "START";
        const buttonClass = isResumeable ? "bg-yellow-400 text-white" : "bg-primary text-white";
  
        return (
          <Link href={`${portalBaseUrl}/?sessionId=${data.session_id}`} target="_blank">
            <PrimaryButton className={`${buttonClass} text-sm rounded-lg w-20 h-8 mr-4 shadow-md shadow-slate-400`}>
              {buttonText}
            </PrimaryButton>
          </Link>
        );
      } else {
        return (
          <p className="text-xs italic font-normal mr-4">
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
          <div>
            <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Live Classes</h1>
            {renderLiveClasses()}
          </div>

          <div className="pb-40">
            {renderTestSection("Tests", [...nonChapterTests, ...chapterTests])}
            {renderTestSection("Practice Tests", practiceTests)}
            {renderTestSection("Homework", homework)}
          </div>
          <BottomNavigationBar />
        </main>
      )}
    </>
  );
}
