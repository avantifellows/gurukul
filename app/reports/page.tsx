"use client"

import ReportsList from "./reports_list";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";
import { useAuth } from "../../services/AuthContext";

export default function ReportsPage() {
    const { loggedIn, userId } = useAuth();

    return (
        <>
            {loggedIn && userId ? (
                <main className="max-w-xl mx-auto bg-white min-h-screen">
                    <TopBar />
                    <ReportsList userId={userId} />
                    <BottomNavigationBar />
                </main>
            ) : (
                <main className="max-w-xl mx-auto bg-white">
                    <TopBar />
                    <Loading />
                </main>
            )}
        </>
    );
}