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
            <main className="max-w-xl mx-auto bg-white lg:max-w-none lg:bg-transparent">
                <TopBar />
                <Loading showReportsOnly={true} />
            </main>
        );
    }

    return (
        <main className="max-w-xl mx-auto bg-white min-h-screen lg:max-w-none lg:bg-transparent">
            <TopBar />
            {/* The desktop header already names the page, so this band is for
                the phone layout only. */}
            <div className="bg-heading h-20 mb-4 lg:hidden">
                <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Test Reports</h1>
            </div>
            <div className="lg:mx-auto lg:max-w-6xl lg:px-10 lg:pt-8 lg:pb-16">
                <ReportsList userId={userId} />
            </div>
            <BottomNavigationBar />
        </main>
    );
}
