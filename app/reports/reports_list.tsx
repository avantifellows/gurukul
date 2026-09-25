import Link from "next/link";
import { Report } from "../types";
import { useState, useEffect } from "react";
import { getReports } from "@/api/reporting/reports";
import { ReportsListProps } from "../types";
import { MixpanelTracking } from "@/services/mixpanel";
import { MIXPANEL_EVENT } from "@/constants/config";
import { formatDate } from "@/utils/dateUtils";
import { buildReportLink } from "@/utils/resourceUtils";
import { useAuth } from "@/services/AuthContext";

export default function ReportsList({ userId }: ReportsListProps) {
    const [responseData, setResponseData] = useState<{ reports: Report[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { groupConfig } = useAuth();

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
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.REPORTS_PAGE_VIEW, { page: 'reports_list' });
    }, [userId]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 pb-40 lg:gap-0 lg:pb-0">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center animate-pulse">
                        <div className="bg-card rounded-lg shadow-lg h-24 mx-4 relative flex items-center my-1 md:my-2 w-full lg:mx-0 lg:my-0 lg:mb-3 lg:h-20 lg:bg-white lg:border lg:border-line lg:rounded-xl lg:shadow-none">
                            <div className="bg-gray-200 h-full w-2 absolute left-0 top-0 rounded-s-md lg:rounded-s-xl"></div>
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
            <div className="mt-20 flex items-center justify-center text-center mx-4 lg:mt-0 lg:mx-0 lg:justify-start lg:text-left lg:text-slate-500">
                Sorry! There was an error loading the reports.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 pb-40 lg:gap-0 lg:pb-0">
            {responseData.reports.length > 0 ? (
                <>
                    {responseData.reports.map((report: Report, index: number) => (
                        <Link href={buildReportLink(report.report_link)} target="_blank" key={index} className="bg-card rounded-lg shadow-lg h-24 mx-4 relative flex items-center my-1 md:my-2 lg:mx-0 lg:my-0 lg:mb-3 lg:h-auto lg:py-4 lg:pr-6 lg:justify-between lg:bg-white lg:border lg:border-line lg:rounded-xl lg:shadow-none lg:hover:border-primary lg:transition-colors group">
                            <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md lg:rounded-s-xl`}></div>
                            <div className="text-left mx-6 md:mx-8 lg:ml-7 lg:mr-0">
                                <p className="text-sm md:text-base font-semibold lg:text-[15px] lg:text-ink">{report.test_name}</p>
                                <p className="text-gray-700 text-sm md:text-base mt-2 lg:mt-1 lg:text-sm lg:text-slate-500">Date attempted: {report.start_date ? formatDate(report.start_date) : "Date not available"}</p>
                            </div>
                            <span className="hidden lg:inline text-sm font-medium text-primary shrink-0 group-hover:underline">
                                Open report
                            </span>
                        </Link>
                    ))}
                </>
            ) : (
                <div className="mt-20 flex items-center justify-center text-center mx-4 lg:mt-0 lg:mx-0 lg:justify-start lg:text-left lg:text-slate-500">
                    {groupConfig.noReportsMessage || "The reports will be available once the first test has been completed"}
                </div>
            )}
        </div>
    );
}
