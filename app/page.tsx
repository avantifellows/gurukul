"use client"

import { useAuth } from "@/services/AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { getGroupUser, getGroupSessions, getGroup, getSessions, getSessionSchedule } from "@/api/afdb/session";
import { useState, useEffect } from "react";
import { GroupUser, GroupSession, QuizSession, SessionSchedule, MessageDisplayProps } from "./types";
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
  const [batchId, setBatchId] = useState();

  const fetchUserSessions = async () => {
    try {
      const currentDay = (new Date().getDay() + 6) % 7 + 1;
      const groupUserData = await getGroupUser(userDbId!);

      const groupSessions = await Promise.all(groupUserData.map(async (userData: GroupUser) => {
        const group = await getGroup(userData.group_id);

        const groupIds = group.map((type: any) => type.id);

        const quizId = group.map((quiz: any) => quiz.child_id.parent_id)

        const quizGroup = await getGroup(undefined, quizId[0]);

        const quizGroupIds = quizGroup.map((quizGroup: any) => quizGroup.id);

        const batchId = group.map((groupData: any) => groupData.child_id.id)
        setBatchId(batchId[0])

        const groupSessionData = await Promise.all(groupIds.map(async (groupId: number) => {
          return await getGroupSessions(groupId);
        }));

        const quizGroupSessionData = await Promise.all(quizGroupIds.map(async (quizGroupId: number) => {
          return await getGroupSessions(quizGroupId);
        }));
        const flattenedQuizGroupSessions = quizGroupSessionData.flat();

        const sessionsData = await Promise.all(flattenedQuizGroupSessions.map(async (groupSession: GroupSession) => {
          const sessionData = await getSessions(groupSession.session_id);
          if (!sessionData) {
            return null;
          }
          const isActive = sessionData.is_active;
          const repeatSchedule = sessionData.repeat_schedule;

          if (isActive && repeatSchedule && repeatSchedule.type === 'weekly' && repeatSchedule.params.includes(currentDay)) {
            return sessionData;
          }
          return null;
        }));
        const filteredSessions = sessionsData.filter(session => session !== null);
        const quizzesData = filteredSessions.filter((session: any) => session.platform === 'quiz');

        const flattenedGroupSessions = groupSessionData.flat();
        setQuizzes(quizzesData);
        return flattenedGroupSessions;
      }));

      const flattenedGroupSessions = groupSessions.flat();

      const sessionsData = await Promise.all(flattenedGroupSessions.map(async (groupSession: GroupSession) => {
        const sessionScheduleData = await getSessionSchedule(groupSession.session_id, batchId);
        if (!sessionScheduleData) {
          return null;
        }
        const isActive = sessionScheduleData.session.is_active;
        const repeatSchedule = sessionScheduleData.session.repeat_schedule;

        if (isActive && repeatSchedule && repeatSchedule.type === 'weekly' && repeatSchedule.params.includes(currentDay)) {
          return sessionScheduleData;
        }
        return null;
      }));

      const filteredSessions = sessionsData.filter(session => session !== null);

      const liveClassesData = filteredSessions.filter((sessionSchedule: SessionSchedule) => sessionSchedule.session.platform === 'meet');
      setLiveClasses(liveClassesData);
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
                          <span>{data.testFormat}</span>
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
