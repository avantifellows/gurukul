"use client"

import Client from "./client";
import ReportsList from "./reports_list";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";
import { useAuth } from "../../services/AuthContext";

export default function ReportsPage() {
    const { loggedIn } = useAuth();

    return (
        <>
            {/* {loggedIn ? ( */}
            <main className="max-w-xl mx-auto bg-white">
                <TopBar />
                <Client message="">
                    <ReportsList />
                </Client>
                <BottomNavigationBar />
            </main>
            {/* ) : (
                <main className="max-w-xl mx-auto bg-white">
                    <TopBar />
                    <Loading />
                </main>

            )} */}
        </>
    );
}
