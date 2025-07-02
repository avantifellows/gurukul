import Link from "next/link";
import { Report } from "../types";
import { useState, useEffect } from "react";
import { getReports } from "@/api/reporting/reports";
import { ReportsListProps } from "../types";
import { MixpanelTracking } from "@/services/mixpanel";
import { MIXPANEL_EVENT } from "@/constants/config";
import { formatDate } from "@/utils/dateUtils";

export default function ReportsList({ userId }: ReportsListProps) {
    const [responseData, setResponseData] = useState<{ reports: Report[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchReportsData() {
            try {
                const data = await getReports(userId);
                data.reports.sort((a: Report, b: Report) =>
                    new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
                );
                setResponseData(data);
            } catch (error) {
                throw error;
            } finally {
                setIsLoading(false);
            }
        }

        fetchReportsData();
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.REPORTS_PAGE_VIEW);
    }, [userId]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 pb-40 lg:pb-20">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center lg:block animate-pulse">
                        <div className="bg-card rounded-lg shadow-lg h-24 lg:h-32 mx-4 lg:mx-0 relative flex items-center my-1 md:my-2 lg:my-0 w-full">
                            <div className="bg-gray-200 h-full w-2 absolute left-0 top-0 rounded-s-md"></div>
                            <div className="mx-6 md:mx-8 flex flex-col gap-2 flex-1">
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!responseData) {
        return (
            <div className="mt-20 flex items-center justify-center text-center mx-4">
                Sorry! There was an error loading the reports.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 pb-40 lg:pb-20">
            {responseData.reports.length > 0 ? (
                <>
                    {responseData.reports.map((report: Report, index: number) => (
                        <Link href={report.report_link} target="_blank" key={index} className="bg-card rounded-lg shadow-lg h-24 lg:h-32 mx-4 lg:mx-0 relative flex items-center my-1 md:my-2 lg:my-0 hover:shadow-xl transition-shadow duration-200">
                            <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`}></div>
                            <div className="text-left mx-6 md:mx-8 lg:flex lg:flex-col lg:justify-center lg:h-full">
                                <p className="text-sm md:text-base lg:text-lg font-semibold">{report.test_name}</p>
                                <p className="text-gray-700 text-sm md:text-base lg:text-sm mt-2">Date attempted: {report.start_date ? formatDate(report.start_date) : "Date not available"}</p>
                            </div>
                        </Link>
                    ))}
                </>
            ) : (
                <div className="mt-20 lg:col-span-full flex items-center justify-center text-center mx-4">
                    Sorry! There are no reports available.
                </div>
            )}
        </div>
    );
}
