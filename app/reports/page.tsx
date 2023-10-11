// A server page containing client component and nested server component

import Client from "./client";
import ReportsList from "./reports_list";
import { Suspense } from "react";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";
import TopBar from "@/components/TopBar";

export default async function ReportsData() {
    return (
        <div>
            <TopBar />
            <Client message="">
                <Suspense fallback={<Loading />}>
                    <ReportsList />
                </Suspense>
            </Client>
            <BottomNavigationBar />
        </div>
    );
}
