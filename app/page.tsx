"use client"
import { useAuth } from "./AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import { getSessionOccurrences, getSessions } from "./SessionList";
import { useState, useEffect } from "react";
import { LiveClasses } from "./types";
import Link from "next/link";
import PrimaryButton from "@/components/Button";
import Loading from "./loading";

export default function Home() {
  const { loggedIn, userId } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClasses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<LiveClasses[]>([]);
  const baseUrl = process.env.NEXT_PUBLIC_AF_QUIZ_URL;
  const apiKey = process.env.NEXT_PUBLIC_AF_QUIZ_API_KEY;
  const userID = process.env.NEXT_PUBLIC_AF_QUIZ_USER_ID;

  const fetchSessionOccurrencesAndDetails = async () => {
    try {
      const sessionOccurrenceData = await getSessionOccurrences();
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      const todaySessions = [];

      for (const sessionOccurrence of sessionOccurrenceData) {
        const sessionStartTime = new Date(sessionOccurrence.start_time);

        if (isSameDay(sessionStartTime, currentDate)) {
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

  function renderButton(data: { sessionOccurrence: any, sessionDetail: any }) {
    const currentTime = new Date();
    const sessionTimeStr = formatTime(data.sessionOccurrence.start_time);
    const currentTimeStr = formatTime(currentTime.toISOString());

    if (data.sessionDetail.platform === 'meet') {
      if (sessionTimeStr <= currentTimeStr) {
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
      return (
        <Link href={`${baseUrl}${data.sessionDetail.platform_link}?apiKey=${apiKey}&userId=${userID}`} target="_blank">
          <PrimaryButton
            className="bg-primary text-white text-sm rounded-lg w-16 h-8 mr-4 shadow-md shadow-slate-400">START</PrimaryButton>
        </Link>
      );
    }
    return null;
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      try {
        await fetchSessionOccurrencesAndDetails();
      } catch (error) {
        console.log("Error:", error)
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);


  return (
    <>
      {/* {loggedIn ? ( */}
      {isLoading ? (
        <div className="max-w-xl mx-auto">
          <TopBar />
          <Loading />
        </div>
      ) : (
        <main className="max-w-xl mx-auto md:mx-auto bg-white">
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
            </div>
          </div>
          <div className="bg-heading">
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
            </div>
          </div>
          <BottomNavigationBar />
        </main>)}
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
