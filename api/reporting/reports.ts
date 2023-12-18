"use server"

import { api } from "@/services/url";
import axios from "axios";
import getAxiosConfig from "../axiosConfig";

const apiKey = process.env.AF_REPORTS_DB_API_KEY || '';

export async function getReports() {
    // Temporary till we implement tokens in portal
    const studentId = process.env.STUDENT_ID;
    const url = `${api.reports.baseUrl}${api.reports.student_reports}${studentId}?format=json`;

    try {
        const responseData = await axios.get(url, {
            ...getAxiosConfig(apiKey),
        });
        return responseData.data;
    } catch (error) {
        throw error;
    }
}
