import { NextResponse } from 'next/server';
import getFetchConfig from '@/api/fetchConfig';
import { api } from '@/services/url';

const afdbBaseUrl = api.afdb.baseUrl;
const afdbBearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    try {
        switch (action) {
            case 'occurrences': {
                const sessionIds = searchParams.get('session_ids');
                if (!sessionIds) return NextResponse.json({ error: 'Session IDs are required' }, { status: 400 });

                const queryParams = new URLSearchParams();
                queryParams.append('session_ids', sessionIds);
                queryParams.append('is_start_time', 'today');

                const urlWithParams = `${afdbBaseUrl}/session-occurrence?${queryParams.toString()}`;
                const response = await fetch(urlWithParams, getFetchConfig(afdbBearerToken));

                if (!response.ok) {
                    throw new Error(`Error in fetching Session Occurrence Details: ${response.statusText}`);
                }

                const data = await response.json();
                return NextResponse.json(data);
            }

            case 'user-sessions': {
                const userId = searchParams.get('user_id');
                const isQuiz = searchParams.get('quiz') === 'true';

                if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

                let urlWithParams = `${afdbBaseUrl}/user/${userId}/sessions`;
                if (isQuiz) {
                    urlWithParams += '?quiz=true';
                }

                const response = await fetch(urlWithParams, getFetchConfig(afdbBearerToken));
                if (!response.ok) {
                    throw new Error('Failed to fetch sessions');
                }

                const data = await response.json();
                return NextResponse.json(data);
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in session API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 