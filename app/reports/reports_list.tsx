// A server page containing client component and nested server component
import { api } from "@/services/url";
import Link from "next/link";
import { Report } from "../types";

export async function getData() {
    const apiKey = process.env.AF_REPORTS_DB_API_KEY;
    // Temporary till we implement tokens in portal
    const studentId = process.env.NEXT_PUBLIC_STUDENT_ID;
    const url = `${api.reports.baseUrl}${api.reports.student_reports}${studentId}?format=json`;

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
        throw error;
    }
}

export default async function ReportsList() {
    const responseData = await getData();

    return (
        <div className="grid grid-cols-1 gap-4 pb-40">
            {responseData.reports.map((report: Report, index: number) => (
                <Link href={report.report_link} target="_blank" key={index} className="bg-card rounded-lg shadow-lg h-24 mx-4 mt-4 relative"
                >
                    <div className="bg-red-200 h-full w-2 absolute left-0 top-0"></div>
                    <p className="text-sm font-semibold mx-4 mt-2">{report.test_name}</p>
                    <p className="text-gray-700 text-sm mx-4 mt-2">Rank: {report.rank}</p>
                </Link>
            ))}
        </div>
    );
}
