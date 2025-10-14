"use client"

import { useState, useEffect } from "react";
import { SchoolReport, SchoolReportsResponse } from "../types";
import { getSchoolReports, getSchoolReportUrl } from "@/api/reporting/schoolReports";
import { MixpanelTracking } from "@/services/mixpanel";
import { MIXPANEL_EVENT } from "@/constants/config";

interface SchoolReportsListProps {
    schoolCode: string;
}

export default function SchoolReportsList({ schoolCode }: SchoolReportsListProps) {
    const [responseData, setResponseData] = useState<SchoolReportsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingReportId, setLoadingReportId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchReportsData() {
            try {
                const data = await getSchoolReports(schoolCode);
                setResponseData(data);
            } catch (error) {
                console.error("Error fetching school reports:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchReportsData();
        MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.REPORTS_PAGE_VIEW, {
            page: 'school_reports_list',
            school_code: schoolCode
        });
    }, [schoolCode]);

    const handleReportClick = async (testName: string) => {
        setLoadingReportId(testName);

        try {
            const data = await getSchoolReportUrl(schoolCode, testName);

            // Open PDF in new tab
            window.open(data.url, '_blank');

            MixpanelTracking.getInstance().trackEvent(MIXPANEL_EVENT.REPORTS_PAGE_VIEW, {
                test_name: testName,
                school_code: schoolCode
            });
        } catch (error) {
            console.error("Error fetching report URL:", error);
            alert("Failed to load report. Please try again.");
        } finally {
            setLoadingReportId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 pb-40">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center animate-pulse">
                        <div className="bg-card rounded-lg shadow-lg h-24 mx-4 relative flex items-center my-1 md:my-2 w-full">
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
        <div className="grid grid-cols-1 gap-4 pb-40">
            {responseData.data.length > 0 ? (
                <>
                    {responseData.data.map((report: SchoolReport, index: number) => (
                        <button
                            key={index}
                            onClick={() => handleReportClick(report.test_name)}
                            disabled={loadingReportId === report.test_name}
                            className="bg-card rounded-lg shadow-lg h-24 mx-4 relative flex items-center my-1 md:my-2 hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className={`${index % 2 === 0 ? 'bg-orange-200' : 'bg-red-200'} h-full w-2 absolute left-0 top-0 rounded-s-md`}></div>
                            <div className="text-left mx-6 md:mx-8 flex-1">
                                <p className="text-sm md:text-base font-semibold">{report.test_name}</p>
                                <p className="text-gray-700 text-sm md:text-base mt-2">
                                    {loadingReportId === report.test_name ? 'Loading...' : 'Click to view report'}
                                </p>
                            </div>
                            <div className="mr-6">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </button>
                    ))}
                </>
            ) : (
                <div className="mt-20 flex items-center justify-center text-center mx-4">
                    No reports available yet. Reports will appear after tests are completed.
                </div>
            )}
        </div>
    );
}
