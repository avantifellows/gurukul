"use server"

import { api } from "@/services/url";
import getFetchConfig from "../fetchConfig";
import { requireSession } from "@/api/auth/requireSession";

/**
 * Returns the signed-in user's own reports.
 *
 * The user id comes from the verified session, not the caller, so this action
 * cannot be used to read another user's reports by id. The parameter is ignored
 * and kept only so existing callers still type-check.
 */
export async function getReports(_userId?: string) {
    const { userId } = await requireSession();
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
