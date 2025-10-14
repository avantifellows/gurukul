"use server"

import { api } from "@/services/url";
import getFetchConfig from "../fetchConfig";

export async function getSchoolReports(schoolCode: string) {
    const apiKey = process.env.DB_SERVICE_API_KEY;
    const url = `${api.dbservice.baseUrl}/api/reports?school_code=${schoolCode}`;

    try {
        const response = await fetch(url, getFetchConfig(apiKey!));

        if (!response.ok) {
            throw new Error(`Error fetching school reports: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

export async function getSchoolReportUrl(schoolCode: string, testName: string) {
    const apiKey = process.env.DB_SERVICE_API_KEY;
    const encodedTestName = encodeURIComponent(testName);
    const url = `${api.dbservice.baseUrl}/api/reports/${encodedTestName}?school_code=${schoolCode}`;

    try {
        const response = await fetch(url, getFetchConfig(apiKey!));

        if (!response.ok) {
            throw new Error(`Error fetching report URL: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}