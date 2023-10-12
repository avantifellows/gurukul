import { api } from "@/services/url";
import Link from "next/link";
import { Report } from "../types";
import axios from "axios";
import { useState, useEffect } from "react";
import Loading from "../loading";

export async function getData() {
    const apiKey = process.env.NEXT_PUBLIC_AF_REPORTS_DB_API_KEY;
    // Temporary till we implement tokens in portal
    const studentId = process.env.NEXT_PUBLIC_STUDENT_ID;
    const url = `${api.reports.baseUrl}${api.reports.student_reports}${studentId}?format=json`;

    try {
        const responseData = await axios.get(url, {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        });
        return responseData.data;
    } catch (error) {
        throw error;
    }
}

export default function ReportsList() {
    const [responseData, setResponseData] = useState<{ reports: Report[] } | null>(null);

    useEffect(() => {
        async function fetchReportsData() {
            try {
                const data = await getData();
                setResponseData(data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }

        fetchReportsData();
    }, []);

    if (!responseData) {
        return <Loading />;
    }

    return (
        <div className="grid grid-cols-1 gap-4 pb-40">
            {responseData.reports.map((report: Report, index: number) => (
                <Link href={report.report_link} target="_blank" key={index} className="bg-card rounded-lg shadow-lg h-24 mx-4 mt-4 relative">
                    <div className="bg-red-200 h-full w-2 absolute left-0 top-0"></div>
                    <p className="text-sm font-semibold mx-4 mt-2">{report.test_name}</p>
                    <p className="text-gray-700 text-sm mx-4 mt-2">Rank: {report.rank}</p>
                </Link>
            ))}
        </div>
    );
}
