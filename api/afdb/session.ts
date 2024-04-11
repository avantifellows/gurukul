"use server"

import getFetchConfig from '../fetchConfig';

const url = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export const getSessionSchedule = async (sessionId: number, batchId?: number) => {
  try {
    const queryParams = new URLSearchParams();
    if (sessionId !== undefined) queryParams.append('session_id', sessionId.toString());
    if (batchId !== undefined) queryParams.append('batch_id', batchId.toString());
    const urlWithParams = `${url}/session-schedule?${queryParams.toString()}`;
    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching Session Schedule Details: ${response.statusText}`);
    }

    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Error in fetching Session Schedule Details:", error);
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
