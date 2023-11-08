"use client"
import { useAuth } from "./AuthContext";
import TopBar from "@/components/TopBar";
import BottomNavigationBar from "@/components/BottomNavigationBar";

export default function Home() {
  const { loggedIn, userId } = useAuth();

  return (
    <>
      {loggedIn ? (
        <main className="max-w-xl mx-auto bg-white">
          <TopBar />
          <div className="min-h-screen bg-heading">
            <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Welcome to Gurukul</h1>
          </div>
          <BottomNavigationBar />
        </main>
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
