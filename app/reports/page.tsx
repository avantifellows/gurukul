"use client"

import Client from "./client";
import ReportsList from "./reports_list";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";
import { useAuth } from "../AuthContext";
import AccessDenied from "@/components/AccessDenied";
import { useState, useEffect } from "react";

export default function ReportsData() {
    const [isLoading, setIsLoading] = useState(true);
    const { loggedIn } = useAuth();

    useEffect(() => {
        if (loggedIn) {
            setIsLoading(false);
        }
    }, [loggedIn]);

    return (
        <>
            {isLoading ? (
                <Loading />
            ) : loggedIn ? (
                <div>
                    <TopBar />
                    <Client message="">
                        <ReportsList />
                    </Client>
                    <BottomNavigationBar />
                </div>
            ) : (
                <AccessDenied />
            )}
        </>
    );
}
