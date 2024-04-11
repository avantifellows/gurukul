"use client"

import { useAuth } from "@/services/AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { getSessionSchedule, fetchUserSession } from "@/api/afdb/session";
import { useState, useEffect } from "react";
import { QuizSession, SessionSchedule, MessageDisplayProps, Session } from "./types";
import Link from "next/link";
import PrimaryButton from "@/components/Button";
import Loading from "./loading";
import { formatCurrentTime, formatSessionTime, formatQuizSessionTime, formatTime, isSessionActive, format12HrQuizSessionTime } from "@/utils/dateUtils";
import { api } from "@/services/url";
import { MixpanelTracking } from "@/services/mixpanel";

export default function Home() {
  const { loggedIn, userId, userDbId } = useAuth();
  const [liveClasses, setLiveClasses] = useState<SessionSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizSession[]>([]);
  const commonTextClass = "text-gray-700 text-xs md:text-sm mx-3 md:mx-8 whitespace-nowrap w-12";
  const infoMessageClass = "flex items-center justify-center text-center h-72 mx-4 pb-40";
  const portalBaseUrl = api.portal.frontend.baseUrl;

  const fetchUserSessions = async () => {
    try {
      const currentDay = (new Date().getDay() + 6) % 7 + 1;

      const [liveSessionData, quizSessionData] = await Promise.all([
        fetchUserSession(userDbId!),
        fetchUserSession(userDbId!, true)
      ]);

      const filteredQuizSessions = quizSessionData.filter((quiz: Session) => {
        const { is_active: isActive, repeat_schedule: repeatSchedule } = quiz;
        return isActive && repeatSchedule &&
          repeatSchedule.type === 'weekly' &&
          repeatSchedule.params.includes(currentDay);
      }).filter(Boolean);

      const quizSessions = filteredQuizSessions.filter((session: Session) => session.platform === 'quiz');
      setQuizzes(quizSessions);

      const sessionsData = await Promise.all(liveSessionData.map(async (liveSession: Session) => {
        const sessionScheduleData = await getSessionSchedule(liveSession.id);
        if (!sessionScheduleData) return null;

        const { is_active: isActive, repeat_schedule: repeatSchedule } = sessionScheduleData.session;
        return isActive && repeatSchedule &&
          repeatSchedule.type === 'weekly' &&
          repeatSchedule.params.includes(currentDay) ? sessionScheduleData : null;
      }));

      const liveSessions = sessionsData.filter(sessionSchedule => sessionSchedule)
        .filter(sessionSchedule => sessionSchedule.session.platform === 'meet');

      setLiveClasses(liveSessions);
      MixpanelTracking.getInstance().identify(userId!);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
    }
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
    const hasSessionNotEnded = sessionEndTime.getTime() > currentTimeObj.getTime()

    if (data.session && data.session.platform === 'meet') {
      if (minutesUntilSessionStart <= 5 && hasSessionNotEnded) {
        return (
          <Link href={`${portalBaseUrl}/?sessionId=${data.session.session_id}`} target="_blank">
            <PrimaryButton
              className="bg-primary text-white text-sm rounded-lg w-12 h-8 mr-4 shadow-md shadow-slate-400">JOIN</PrimaryButton>
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
    }
    else if (data.platform === 'quiz') {
      if (minutesUntilSessionStart <= 5 && hasSessionNotEnded) {
        return (
          <Link href={`${portalBaseUrl}/?sessionId=${data.session_id}`} target="_blank">
            <PrimaryButton
              className="bg-primary text-white text-sm rounded-lg w-16 h-8 mr-4 shadow-md shadow-slate-400">START</PrimaryButton>
          </Link>
        );
      } else {
        return (
          <p className="text-xs italic font-normal mr-4">
            Starts at <br />
            {format12HrQuizSessionTime(data.start_time)}
          </p>
        );
      }
    }
    return null;
  }

  function MessageDisplay({ message }: MessageDisplayProps) {
    return <p className={infoMessageClass}>{message}</p>;
  }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (userDbId !== null) {
        await fetchUserSessions();
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      fetchData();
    }
  }, [loggedIn, userDbId]);

  return (
    <>
      {isLoading ? (
        <div className="max-w-xl mx-auto">
          <TopBar />
          <Loading />
        </div>
      ) : (
        <main className="min-h-screen max-w-xl mx-auto md:mx-auto bg-white">
          <TopBar />
          <div className="bg-heading">
            <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Live Classes</h1>
            {liveClasses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 pb-16">
                {liveClasses.map((data, index) => (isSessionActive(formatSessionTime(data.end_time)) &&
                  <div key={index} className="flex mt-4 items-center" >
                    <div>
                      <p className={`${commonTextClass}`}>
                        {formatTime(data.start_time)}
                      </p>
                      <p className={`${commonTextClass}`}>
                        {formatTime(data.end_time)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4 items-center">
                      <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`}></div>
                      <div className="text-sm md:text-base mx-6 md:mx-8 w-36">
                        <span className="font-semibold">{data.session.meta_data.subject ?? "Science"} </span>
                        <div className="text-sm md:text-base ">
                          {data.session.name}
                        </div>
                      </div>
                      {renderButton(data)}
                    </div>
                  </div>
                ))}
                {liveClasses.filter((data) => isSessionActive(formatSessionTime(data.end_time))).length === 0 && (
                  <MessageDisplay message="No more live classes are scheduled for today!" />
                )}
              </div>) : (
              <MessageDisplay message="No more live classes are scheduled for today!" />
            )}
          </div>
          <div className="bg-heading">
            <h1 className="text-primary ml-4 font-semibold text-xl">Tests</h1>
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 pb-40">
                {quizzes.map((data, index) => (isSessionActive(formatQuizSessionTime(data.end_time)) &&
                  <div key={index} className="flex mt-4 items-center" >
                    <div>
                      <p className={`${commonTextClass}`}>
                        {format12HrQuizSessionTime(data.start_time)}
                      </p>
                      <p className={`${commonTextClass}`}>
                        {format12HrQuizSessionTime(data.end_time)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4 items-center">
                      <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0  rounded-s-md`}></div>
                      <div className="text-sm md:text-base mx-6 md:mx-8">
                        <div className="flex w-36">
                          <span className="font-semibold">{data.name}</span>
                        </div>
                        <div className="text-sm md:text-base">
                          <span>{data.meta_data.test_format}</span>
                        </div>
                      </div>
                      {renderButton(data)}
                    </div>
                  </div>
                ))}
                {quizzes.filter((data) => isSessionActive(formatQuizSessionTime(data.end_time))).length === 0 && (
                  <MessageDisplay message="No more tests are scheduled for today!" />
                )}
              </div>) : (
              <MessageDisplay message="No more tests are scheduled for today!" />
            )}
          </div>
          <BottomNavigationBar />
        </main>)}
    </>
  );
}
