"use client"

import ReportsList from "./reports_list";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";
import AccessControlWrapper from "@/components/AccessControlWrapper";
import { useAuth } from "../../services/AuthContext";

export default function ReportsPage() {
    const { loggedIn, userId } = useAuth();

    if (!loggedIn || !userId) {
        return (
            <AccessControlWrapper tabName="reports">
                <main className="max-w-xl mx-auto bg-white">
                    <TopBar />
                    <Loading showReportsOnly={true} />
                </main>
            </AccessControlWrapper>
        );
    }

    return (
        <AccessControlWrapper tabName="reports">
            <main className="max-w-xl mx-auto bg-white min-h-screen">
                <TopBar />
                <div className="bg-heading h-20 mb-4">
                    <h1 className="text-primary ml-4 font-semibold text-xl pt-6">Test Reports</h1>
                </div>
                <ReportsList userId={userId} />
                <BottomNavigationBar />
            </main>
        </AccessControlWrapper>
    );
}