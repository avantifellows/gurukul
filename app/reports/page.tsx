"use client"

import ReportsList from "./reports_list";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";
import { useAuth } from "../../services/AuthContext";

export default function ReportsPage() {
    const { loggedIn, userId } = useAuth();

    if (!loggedIn || !userId) {
        return (
            <main className="max-w-xl mx-auto lg:max-w-none lg:mx-0 lg:p-6 bg-white lg:bg-transparent">
                <TopBar />
                <Loading showReportsOnly={true} />
            </main>
        );
    }

    return (
        <main className="max-w-xl mx-auto lg:max-w-none lg:mx-0 lg:p-6 bg-white lg:bg-transparent min-h-screen">
            <TopBar />
            <div className="bg-heading lg:bg-transparent h-20 mb-4 lg:mb-6">
                <h1 className="text-primary ml-4 lg:ml-0 font-semibold text-xl lg:text-2xl pt-6 lg:pt-4">Test Reports</h1>
            </div>
            <ReportsList userId={userId} />
            <BottomNavigationBar />
        </main>
    );
}