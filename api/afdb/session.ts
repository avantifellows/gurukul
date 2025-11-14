"use server"

import getFetchConfig from '../fetchConfig';

const url = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export const getSessionOccurrences = async (sessionIds: string[]) => {
  try {
    const response = await fetch(`${url}/session-occurrence/search`, {
      ...getFetchConfig(bearerToken, { 'Content-Type': 'application/json' }),
      method: 'POST',
      body: JSON.stringify({
        session_ids: sessionIds,
        is_start_time: 'today'
      }),
      cache: 'no-store',
      next: { revalidate: 0 }
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

export const fetchUserSession = async (userId: number, isQuiz = false) => {
  try {
    let urlWithParams = `${url}/user/${userId}/sessions`;
    if (isQuiz) {
      urlWithParams += '?quiz=true';
    }

    const response = await fetch(urlWithParams, {
      ...getFetchConfig(bearerToken),
      cache: 'no-store',
      next: { revalidate: 0 }
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
