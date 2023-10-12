"use client"

import Client from "./client";
import ReportsList from "./reports_list";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";
import { useAuth } from "../AuthContext";

export default function ReportsData() {
    const { loggedIn } = useAuth();

    return (
        <>
            {loggedIn ? (
                <div>
                    <TopBar />
                    <Client message="">
                        <ReportsList />
                    </Client>
                    <BottomNavigationBar />
                </div>
            ) : (
                <Loading />
            )}
        </>
    );
}
