// A server page containing client component and nested server component

import Client from "./client";
import ReportsList from "./reports_list";
import { Suspense } from "react";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";

export default async function ReportsPage() {
    return (
        <div>
            <h1>Reports Page</h1>
            <Client message="">
                <Suspense fallback={<Loading />}>
                    <ReportsList />
                </Suspense>
            </Client>
            <BottomNavigationBar />
        </div>
    );
}
