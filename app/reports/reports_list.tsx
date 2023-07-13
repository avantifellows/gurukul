// A server page containing client component and nested server component

import { ReportResponse } from "../types";
import Client from "./client";

export async function getData() {
    const apiKey = process.env.AF_REPORTS_DB_API_KEY;
    const studentId = process.env.NEXT_PUBLIC_STUDENT_ID;
    const url = `${process.env.AF_REPORTS_URL}/student_reports/${studentId}?format=json`;
    console.log(url);
    console.log(apiKey);

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

export default async function ReportsList() {
    const responseData = await getData();

    return (
        <div>
            <div>
                <pre id="json">{JSON.stringify(responseData, null, 4)}</pre>
            </div>
        </div>
    );
}
