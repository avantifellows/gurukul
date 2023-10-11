"use client"

import Client from "./client";
import ReportsList from "./reports_list";
import { Suspense } from "react";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";
import { useAuth } from "../AuthContext";
import AccessDenied from "@/components/AccessDenied";

export default async function ReportsData() {
    const { loggedIn } = useAuth();
    return (
        <>
            {loggedIn ? (<div>
                <TopBar />
                <Client message="">
                    <Suspense fallback={<Loading />}>
                        <ReportsList />
                    </Suspense>
                </Client>
                <BottomNavigationBar />
            </div>) : (
                <AccessDenied />
            )
            }
        </>
    );
}
