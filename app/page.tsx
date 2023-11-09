"use client"
import { useAuth } from "./AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { getSessionOccurrences, getSessions } from "./SessionList";
import { useState, useEffect } from "react";
import { LiveClasses } from "./types";
import Link from "next/link";
import PrimaryButton from "@/components/Button";

export default function Home() {
  const { loggedIn, userId } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClasses[]>([]);
  const [quizzes, setQuizzes] = useState<LiveClasses[]>([]);
  const baseUrl = process.env.NEXT_PUBLIC_AF_QUIZ_URL;
  const apiKey = process.env.NEXT_PUBLIC_AF_QUIZ_API_KEY;
  const userID = process.env.NEXT_PUBLIC_AF_QUIZ_USER_ID;

  const fetchSessionOccurrencesAndDetails = async () => {
    try {
      const sessionOccurrenceData = await getSessionOccurrences();
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const endOfWeek = new Date();
      endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));

      const todaySessions = [];

      for (const sessionOccurrence of sessionOccurrenceData) {
        const sessionStartTime = new Date(sessionOccurrence.start_time);

        if (sessionStartTime > currentDate && sessionStartTime <= endOfWeek) {
          try {
            const sessionDetail = await getSessions(sessionOccurrence.session_fk);
            if (isSameDay(sessionStartTime, currentDate)) {
              todaySessions.push({
                sessionOccurrence,
                sessionDetail,
              });
            }
          } catch (error) {
            console.error("Error fetching session details for session ID:", sessionOccurrence.session_fk, error);
          }
        }
      }

      // Filter sessions based on the platform (live class or quiz)
      const liveClassesToday = todaySessions.filter(data => data.sessionDetail.platform === "meet");
      const quizzesToday = todaySessions.filter(data => data.sessionDetail.platform === "quiz");

      setLiveClasses(liveClassesToday);
      setQuizzes(quizzesToday);
    } catch (error) {
      console.error("Error in fetching Live Classes:", error);
    }
  }


  function isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }


  function formatTime(dateTimeStr: string) {
    const date = new Date(dateTimeStr);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  function isToday(dateStr: string) {
    const date = new Date(dateStr);
    const todayDate = new Date();
    return (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    );
  }

  useEffect(() => {
    fetchSessionOccurrencesAndDetails();
  }, []);

  return (
    <>
      {/* {loggedIn ? ( */}
      <main className="md:max-w-xl md:mx-auto bg-white">
        <TopBar />
        <div className="min-h-screen bg-heading">
          <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Live Classes</h1>
          <div className="grid grid-cols-1 gap-4 pb-16">
            {liveClasses.map((data, index) => (
              <div key={index} className="flex mt-4 items-center" >
                <div>
                  <p className="text-gray-700 text-sm md:text-base mx-6 md:mx-8">
                    {formatTime(data.sessionOccurrence.start_time)}
                  </p>
                  <p className="text-gray-700 text-sm md:text-base mx-6 md:mx-8">
                    {formatTime(data.sessionOccurrence.end_time)}
                  </p>
                </div>
                <div className="bg-card rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4">
                  <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0`}></div>
                  <div className="text-sm md:text-base font-semibold mx-6 md:mx-8">
                    <span className="font-normal pr-4">Subject:</span> {data.sessionDetail.meta_data.subject ?? "Science"}
                    <div className="text-sm md:text-base font-semibold ">
                      <span className="font-normal pr-7">Batch:</span> {data.sessionDetail.meta_data.batch ?? "Master Batch"}
                    </div>
                  </div>
                  {isToday(data.sessionOccurrence.start_time) ? (
                    <Link href={`https://${data.sessionDetail.platform_link}`} target="_blank">
                      <PrimaryButton
                        className="bg-primary text-white text-sm rounded-lg w-14 h-8 mr-4 shadow-md shadow-slate-400">JOIN</PrimaryButton>
                    </Link>
                  ) : (
                    <p className="text-sm italic font-normal mr-6">
                      Starts on <br />
                      {formatDate(data.sessionOccurrence.start_time)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="min-h-screen bg-heading">
          <h1 className="text-primary ml-4 font-semibold text-xl">Tests</h1>
          <div className="grid grid-cols-1 gap-4 pb-40">
            {quizzes.map((data, index) => (
              <div key={index} className="flex mt-4 items-center" >
                <div>
                  <p className="text-gray-700 text-sm md:text-base mx-6 md:mx-8">
                    {formatTime(data.sessionOccurrence.start_time)}
                  </p>
                  <p className="text-gray-700 text-sm md:text-base mx-6 md:mx-8">
                    {formatTime(data.sessionOccurrence.end_time)}
                  </p>
                </div>
                <div className="bg-card rounded-lg shadow-lg min-h-24 h-auto py-6 relative w-full flex flex-row justify-between mr-4">
                  <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0`}></div>
                  <div className="text-sm md:text-base font-semibold mx-6 md:mx-8">
                    <span className="font-normal pr-4">Subject:</span> {data.sessionDetail.meta_data.subject ?? "Science"}
                    <div className="text-sm md:text-base font-semibold ">
                      <span className="font-normal pr-7">Batch:</span> {data.sessionDetail.meta_data.batch ?? "Master Batch"}
                    </div>
                  </div>
                  {isToday(data.sessionOccurrence.start_time) ? (
                    <Link href={`${baseUrl}${data.sessionDetail.platform_link}?apiKey=${apiKey}&userId=${userID}`} target="_blank">
                      <PrimaryButton
                        className="bg-primary text-white text-sm rounded-lg w-14 h-8 mr-4 shadow-md shadow-slate-400">JOIN</PrimaryButton>
                    </Link>
                  ) : (
                    <p className="text-sm italic font-normal mr-6">
                      Starts on <br />
                      {formatDate(data.sessionOccurrence.start_time)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <BottomNavigationBar />
      </main>
      {/* ) : (
        <main className="max-w-xl mx-auto bg-white">
          <TopBar />
          <div className="min-h-screen flex flex-col items-center justify-between p-24">
            <p>User not logged in</p>
          </div>
          <BottomNavigationBar />
        </main>
      )} */}
    </>
  );
}
