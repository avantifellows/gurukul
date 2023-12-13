"use server"

import { api } from "@/services/url";
import axios from "axios";

export async function getReports(userId: string) {
    const apiKey = process.env.AF_REPORTS_DB_API_KEY;
    const url = `${api.reports.baseUrl}${api.reports.student_reports}${userId}?format=json`;

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
