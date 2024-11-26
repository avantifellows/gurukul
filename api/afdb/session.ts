"use server"

import getFetchConfig from '../fetchConfig';

const url = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export const getSessionOccurrences = async (sessionIds: string[]) => {
  try {
    const queryParams = new URLSearchParams();

    if (sessionIds && sessionIds.length > 0) {
      queryParams.append('session_ids', sessionIds.join(','));
    }

    queryParams.append('is_start_time', 'today');

    const urlWithParams = `${url}/session-occurrence?${queryParams.toString()}`;

    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

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

    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));
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
