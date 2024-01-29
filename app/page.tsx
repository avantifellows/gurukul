"use client"

import { useAuth } from "@/services/AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { getSessions, getGroupUser, getGroupSessions, getGroupTypes } from "@/api/afdb/session";
import { useState, useEffect } from "react";
import { GroupUser, GroupSession, Session } from "./types";
import Link from "next/link";
import PrimaryButton from "@/components/Button";
import Loading from "./loading";
import { formatCurrentTime, formatSessionTime } from "@/utils/dateUtils";
import { generateQuizLink } from "@/utils/quizUtils";
import { MixpanelTracking } from "@/services/mixpanel";

export default function Home() {
  const { loggedIn, userId, userDbId } = useAuth();
  const [liveClasses, setLiveClasses] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Session[]>([]);
  const commonTextClass = "text-gray-700 text-sm md:text-base mx-6 md:mx-8";
  const infoMessageClass = "flex items-center justify-center text-center h-72 mx-4 pb-40";

  const fetchUserSessions = async () => {
    try {
      const currentDay = new Date().getDay();
      const groupUserData = await getGroupUser(userDbId!);

      const groupSessions = await Promise.all(groupUserData.map(async (userData: GroupUser) => {
        const groupType = await getGroupTypes(userData.group_type_id);

        const groupTypeIds = groupType.map((type: any) => type.id);

        const groupSessionData = await Promise.all(groupTypeIds.map(async (groupId: number) => {
          return await getGroupSessions(groupId);
        }));

        const flattenedGroupSessions = groupSessionData.flat();

        return flattenedGroupSessions;
      }));

      const flattenedGroupSessions = groupSessions.flat();

      const sessionsData = await Promise.all(flattenedGroupSessions.map(async (groupSession: GroupSession) => {
        const sessionData = await getSessions(groupSession.session_id);
        const isActive = sessionData.is_active;
        const repeatSchedule = sessionData.repeat_schedule;

        if (isActive && repeatSchedule && repeatSchedule.type === 'weekly' && repeatSchedule.params.includes(currentDay)) {
          return sessionData;
        }
        return null;
      }));

      const filteredSessions = sessionsData.filter(session => session !== null);

      const liveClassesData = filteredSessions.filter((session: Session) => session.platform === 'meet');
      const quizzesData = filteredSessions.filter((session: Session) => session.platform === 'quiz');

      setLiveClasses(liveClassesData);
      setQuizzes(quizzesData);
      MixpanelTracking.getInstance().identify(userId!);
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
              className="bg-primary text-white text-sm rounded-lg w-12 h-8 mr-4 shadow-md shadow-slate-400">JOIN</PrimaryButton>
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
                No more live classes are scheduled for today!
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
                No more tests are scheduled for today!
              </p>
            )}
          </div>
          <BottomNavigationBar />
        </main>)}
    </>
  );
}
