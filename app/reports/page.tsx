// A server page containing client component and nested server component

import Client from "./client";
import ReportsList from "./reports_list";
import { Suspense } from "react";
import Loading from "../loading";
import BottomNavigationBar from "@/components/BottomNavigationBar";

export async function getData() {
    const apiKey = process.env.AF_REPORTS_DB_API_KEY;
    const studentId = process.env.NEXT_PUBLIC_STUDENT_ID;
    const url = `${process.env.AF_REPORTS_URL}/student_reports/${studentId}?format=json`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.log(error);
    }
}

export default async function ReportsData() {
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
