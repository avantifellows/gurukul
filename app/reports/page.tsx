"use client"

import ReportsList from "./reports_list";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";
import { useAuth, useAccessControl } from "../../services/AuthContext";
import { useEffect } from "react";

export default function ReportsPage() {
    const { loggedIn, userId } = useAuth();
    const { redirectIfNoAccess, groupConfig } = useAccessControl();

    // Access control: redirect if reports tab is hidden for this group
    useEffect(() => {
        redirectIfNoAccess('reports');
    }, [redirectIfNoAccess]);

    // Don't render the page if reports tab is hidden
    if (groupConfig.showReportsTab === false) {
        return null;
    }

    if (!loggedIn || !userId) {
        return (
            <main className="max-w-xl mx-auto bg-white">
                <TopBar />
                <Loading showReportsOnly={true} />
            </main>
        );
    }

    return (
        <main className="max-w-xl mx-auto bg-white min-h-screen">
            <TopBar />
            <div className="bg-heading h-20 mb-4">
                <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Test Reports</h1>
            </div>
            <ReportsList userId={userId} />
            <BottomNavigationBar />
        </main>
    );
}