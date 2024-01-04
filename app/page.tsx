"use client"

import { useAuth } from "@/services/AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { getSessions, getGroupUser, getGroupSessions } from "@/api/afdb/session";
import { useState, useEffect } from "react";
import { GroupSession, Session } from "./types";
import Link from "next/link";
import PrimaryButton from "@/components/Button";
import Loading from "./loading";
import { formatCurrentTime, formatSessionTime } from "@/utils/dateUtils";
import { generateQuizLink } from "@/utils/quizUtils";

export default function Home() {
  const { loggedIn, userId, userDbId } = useAuth();
  const [liveClasses, setLiveClasses] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Session[]>([]);
  const commonTextClass = "text-gray-700 text-sm md:text-base mx-6 md:mx-8";
  const infoMessageClass = "flex items-center justify-center text-center h-72 mx-4 pb-40";

  const fetchUserSessions = async () => {
    try {
      const groupUserData = await getGroupUser(userDbId!);
      const groupSessionData = await getGroupSessions(groupUserData[0].group_type_id);
      const sessionIds = groupSessionData.map((groupSession: GroupSession) => groupSession.session_id);
      const sessionsData = await Promise.all(sessionIds.map((sessionId: number) => getSessions(sessionId)));

      const liveClassesData = sessionsData.filter((session: Session) => session.platform === 'meet');
      const quizzesData = sessionsData.filter((session: Session) => session.platform === 'quiz');

      setLiveClasses(liveClassesData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
    }
  };

  function renderButton(data: any) {
    const currentTime = new Date();
    const sessionTimeStr = formatSessionTime(data.start_time);
    const currentTimeStr = formatCurrentTime(currentTime.toISOString());

    const sessionTime = new Date(`2000-01-01T${sessionTimeStr}`);
    const currentTimeObj = new Date(`2000-01-01T${currentTimeStr}`);
    const timeDifference = (sessionTime.getTime() - currentTimeObj.getTime()) / (1000 * 60);

    if (data.platform === 'meet') {
      if (timeDifference <= 5) {
        return (
          <Link href={data.platform_link} target="_blank">
            <PrimaryButton
              className="bg-primary text-white text-sm rounded-lg w-14 h-8 mr-4 shadow-md shadow-slate-400">JOIN</PrimaryButton>
          </Link>
        );
      } else {
        return (
          <p className="text-sm italic font-normal mr-6">
            Starts at <br />
            {sessionTimeStr}
          </p>
        );
      }
    } else if (data.platform === 'quiz') {
      generateQuizLink(data.platform_link, userId!)
        .then((quizLink) => {
          return (
            <Link href={quizLink} target="_blank">
              <PrimaryButton
                className="bg-primary text-white text-sm rounded-lg w-16 h-8 mr-4 shadow-md shadow-slate-400">START</PrimaryButton>
            </Link>
          );
        })
        .catch((error) => {
          console.error("Error generating quiz link:", error);
          return null;
        });
    }
    return null;
  }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (userDbId !== null) {
        await fetchUserSessions();
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
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
      {isLoading && loggedIn ? (
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
                {liveClasses.map((data, index) => (
                  <div key={index} className="flex mt-4 items-center" >
                    <div>
                      <p className={`${commonTextClass}`}>
                        {formatSessionTime(data.start_time)}
                      </p>
                      <p className={`${commonTextClass}`}>
                        {formatSessionTime(data.end_time)}
                      </p>
                    </div>
                    <div className="bg-card rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4">
                      <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`}></div>
                      <div className="text-sm md:text-base font-semibold mx-6 md:mx-8">
                        <span className="font-normal pr-4">Subject:</span> {data.meta_data.subject ?? "Science"}
                        <div className="text-sm md:text-base font-semibold ">
                          <span className="font-normal pr-7">Batch:</span> {data.meta_data.batch ?? "Master Batch"}
                        </div>
                      </div>
                      {renderButton(data)}
                    </div>
                  </div>
                ))}
              </div>) : (
              <p className={infoMessageClass}>
                There are no more live classes today. You can relax!
              </p>
            )}
          </div>
          <div className="bg-heading">
            <h1 className="text-primary ml-4 font-semibold text-xl">Tests</h1>
            {quizzes.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 pb-40">
                {quizzes.map((data, index) => (
                  <div key={index} className="flex mt-4 items-center" >
                    <div>
                      <p className={`${commonTextClass}`}>
                        {formatSessionTime(data.start_time)}
                      </p>
                      <p className={`${commonTextClass}`}>
                        {formatSessionTime(data.end_time)}
                      </p>
                    </div>
                    <div className="bg-card rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4">
                      <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0  rounded-s-md`}></div>
                      <div className="text-sm md:text-base font-semibold mx-6 md:mx-8">
                        <span className="font-normal pr-4">Subject:</span> {data.meta_data.stream}
                        <div className="text-sm md:text-base font-semibold ">
                          <span className="font-normal pr-9">Type:</span> {data.meta_data.test_type}
                        </div>
                      </div>
                      {renderButton(data)}
                    </div>
                  </div>
                ))}
              </div>) : (
              <p className={`${infoMessageClass}`}>
                There are no more tests today. You can relax!
              </p>
            )}
          </div>
          <BottomNavigationBar />
        </main>)}
    </>
  );
}
