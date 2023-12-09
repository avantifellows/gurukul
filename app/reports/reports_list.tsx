import Link from "next/link";
import { Report } from "../types";
import { useState, useEffect } from "react";
import Loading from "../loading";
import { getData } from "./getReports";

export default function ReportsList() {
    const [responseData, setResponseData] = useState<{ reports: Report[] } | null>(null);

    useEffect(() => {
        async function fetchReportsData() {
            try {
                const data = await getData();
                setResponseData(data);
            } catch (error) {
                throw error;
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
                <Link href={report.report_link} target="_blank" key={index} className="bg-card rounded-lg shadow-lg h-24 mx-4 relative flex items-center my-1 md:my-2">
                    <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`}></div>
                    <div className="text-left mx-6 md:mx-8">
                        <p className="text-sm md:text-base font-semibold">{report.test_name}</p>
                        <p className="text-gray-700 text-sm md:text-base mt-2">Rank: {report.rank}</p>
                    </div>
                </Link>
            ))}
        </div>

    );
}
