import { NextResponse } from 'next/server';
import getFetchConfig from '@/api/fetchConfig';
import { Student } from '@/app/types';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const apaarId = searchParams.get('apaar_id');
    const studentId = searchParams.get('student_id');
    
    // Prefer apaar_id if present, otherwise use student_id
    const id = apaarId || studentId;
    const idType = apaarId ? 'apaar_id' : 'student_id';

    if (!id) {
        return NextResponse.json({ error: 'Student ID or Apaar ID is required' }, { status: 400 });
    }

    try {
        const url = process.env.AF_DB_SERVICE_URL;
        const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN!;

        const queryParams = new URLSearchParams({
            [idType]: id,
        });

        const urlWithParams = `${url}/student?${queryParams.toString()}`;
        const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

        if (!response.ok) {
            throw new Error(`Error fetching student data: ${response.statusText}`);
        }

        const data: Student[] = await response.json();

        if (data.length === 0) {
            console.warn(`No user found for ${idType}: ${id}`);
            return NextResponse.json(null);
        }

        return NextResponse.json(data[0].user);
    } catch (error) {
        console.error('Error fetching student data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 