import { NextResponse } from 'next/server';
import { api } from "@/services/url";
import getFetchConfig from "@/api/fetchConfig";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const apiKey = process.env.AF_REPORTS_DB_API_KEY;
        const url = `${api.reports.baseUrl}${api.reports.student_reports}${userId}?format=json`;

        const response = await fetch(url, getFetchConfig(apiKey!));

        if (!response.ok) {
            throw new Error(`Error fetching reports: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in reports API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 