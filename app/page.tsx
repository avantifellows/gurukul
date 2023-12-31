"use client"

import { useAuth } from "@/services/AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { getSessionOccurrences, getSessions } from "@/api/afdb/session";
import { useState, useEffect } from "react";
import { LiveClasses } from "./types";
import Link from "next/link";
import PrimaryButton from "@/components/Button";
import Loading from "./loading";
import { isSameDay, formatCurrentTime, formatSessionTime } from "@/utils/dateUtils";
import { generateQuizLink } from "@/utils/quizUtils";

export default function Home() {
  const { loggedIn, userId } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClasses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<LiveClasses[]>([]);
  const commonTextClass = "text-gray-700 text-sm md:text-base mx-6 md:mx-8";
  const infoMessageClass = "flex items-center justify-center text-center h-72 mx-4 pb-40";

  const fetchSessionOccurrencesAndDetails = async () => {
    try {
      const sessionOccurrenceData = await getSessionOccurrences();
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const todaySessions = [];

      for (const sessionOccurrence of sessionOccurrenceData) {
        const sessionStartTime = new Date(sessionOccurrence.start_time);
        const formattedSessionTime = formatSessionTime(sessionOccurrence.end_time);
        const formattedCurrentTime = formatCurrentTime(new Date().toISOString());

        if (isSameDay(sessionStartTime, currentDate) && formattedSessionTime > formattedCurrentTime) {
          try {
            const sessionDetail = await getSessions(sessionOccurrence.session_fk);
            todaySessions.push({
              sessionOccurrence,
              sessionDetail,
            });
          } catch (error) {
            console.error("Error fetching session details for session ID:", sessionOccurrence.session_fk, error);
          }
        }
      }

      const liveClassesToday = todaySessions.filter(data => data.sessionDetail.platform === "meet");
      const quizzesToday = todaySessions.filter(data => data.sessionDetail.platform === "quiz");

      setLiveClasses(liveClassesToday);
      setQuizzes(quizzesToday);
    } catch (error) {
      console.error("Error in fetching Live Classes:", error);
    }
  }

  function renderButton(data: { sessionOccurrence: any, sessionDetail: any }) {
    const currentTime = new Date();
    const sessionTimeStr = formatSessionTime(data.sessionOccurrence.start_time);
    const currentTimeStr = formatCurrentTime(currentTime.toISOString());

    const sessionTime = new Date(`2000-01-01T${sessionTimeStr}`);
    const currentTimeObj = new Date(`2000-01-01T${currentTimeStr}`);
    const timeDifference = (sessionTime.getTime() - currentTimeObj.getTime()) / (1000 * 60);

    if (data.sessionDetail.platform === 'meet') {
      if (timeDifference <= 5) {
        return (
          <Link href={`https://${data.sessionDetail.platform_link}`} target="_blank">
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
    } else if (data.sessionDetail.platform === 'quiz') {
      generateQuizLink(data.sessionDetail.platform_link, userId!)
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
      await fetchSessionOccurrencesAndDetails();
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
  }, [loggedIn]);

  return (
    <>
      {loggedIn ? (
        isLoading ? (
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
                          {formatSessionTime(data.sessionOccurrence.start_time)}
                        </p>
                        <p className={`${commonTextClass}`}>
                          {formatSessionTime(data.sessionOccurrence.end_time)}
                        </p>
                      </div>
                      <div className="bg-card rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4">
                        <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`}></div>
                        <div className="text-sm md:text-base font-semibold mx-6 md:mx-8">
                          <span className="font-normal pr-4">Subject:</span> {data.sessionDetail.meta_data.subject ?? "Science"}
                          <div className="text-sm md:text-base font-semibold ">
                            <span className="font-normal pr-7">Batch:</span> {data.sessionDetail.meta_data.batch ?? "Master Batch"}
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
                          {formatSessionTime(data.sessionOccurrence.start_time)}
                        </p>
                        <p className={`${commonTextClass}`}>
                          {formatSessionTime(data.sessionOccurrence.end_time)}
                        </p>
                      </div>
                      <div className="bg-card rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4">
                        <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0  rounded-s-md`}></div>
                        <div className="text-sm md:text-base font-semibold mx-6 md:mx-8">
                          <span className="font-normal pr-4">Subject:</span> {data.sessionDetail.meta_data.stream}
                          <div className="text-sm md:text-base font-semibold ">
                            <span className="font-normal pr-9">Type:</span> {data.sessionDetail.meta_data.test_type}
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
          </main>)
      ) : (
        <main className="max-w-xl mx-auto bg-white">
          <TopBar />
          <div className="min-h-screen flex flex-col items-center justify-between p-24">
            <p>User not logged in</p>
          </div>
          <BottomNavigationBar />
        </main>
      )}
    </>
  );
}
