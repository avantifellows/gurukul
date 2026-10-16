"use server"

import getFetchConfig from '../fetchConfig';
import { istNow, istEndOfToday } from '@/utils/dateUtils';
import { requireSession } from '@/api/auth/requireSession';

const url = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export const getSessionOccurrences = async (sessionIds: string[]) => {
  try {
    // Require a signed-in user; this action is a public endpoint otherwise.
    await requireSession();
    // Fetch every occurrence overlapping [now, end of today]: sessions open
    // right now (however long ago they started) plus ones starting later
    // today. The UI decides what's joinable vs "Starts at ..." client-side.
    const response = await fetch(`${url}/session-occurrence/search`, {
      ...getFetchConfig(bearerToken, { 'Content-Type': 'application/json' }),
      method: 'POST',
      body: JSON.stringify({
        session_ids: sessionIds,
        end_time_gte: istNow(),
        start_time_lte: istEndOfToday()
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Error in fetching Session Occurrence Details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetching Session Occurrence Details:", error);
    throw error;
  }
};

export const fetchUserSession = async (_userId?: number, isQuiz = false) => {
  try {
    // The user id comes from the verified session, not the caller, so this
    // only ever returns the signed-in user's own sessions. The parameter is
    // ignored and kept only so existing callers still type-check.
    const { userId } = await requireSession();
    let urlWithParams = `${url}/user/${userId}/sessions`;
    if (isQuiz) {
      urlWithParams += '?quiz=true';
    }

    const response = await fetch(urlWithParams, {
      ...getFetchConfig(bearerToken),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch sessions');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching sessions for a user:', error);
    throw error;
  }
};
