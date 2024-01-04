"use server"

import { api } from "@/services/url";
import getFetchConfig from "../fetchConfig";

export async function getReports(userId: string) {
    const apiKey = process.env.AF_REPORTS_DB_API_KEY;
    const url = `${api.reports.baseUrl}${api.reports.student_reports}${userId}?format=json`;

    try {
        const response = await fetch(url, getFetchConfig(apiKey!));

        if (!response.ok) {
            throw new Error(`Error fetching reports: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}
