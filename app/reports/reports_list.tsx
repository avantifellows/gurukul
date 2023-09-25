// A server page containing client component and nested server component
import { api } from "@/services/url";

export async function getData() {
    const apiKey = process.env.AF_REPORTS_DB_API_KEY;
    // Temporary till we implement tokens in portal
    const studentId = process.env.NEXT_PUBLIC_STUDENT_ID;
    const url = `${api.reports.baseUrl}${api.reports.student_reports}${studentId}?format=json`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        });
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.log(error);
    }
}

export default async function ReportsList() {
    const responseData = await getData();

    return (
        <div>
            <div>
                <pre id="json">{JSON.stringify(responseData, null, 4)}</pre>
            </div>
        </div>
    );
}
