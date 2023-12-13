"use server"

import axios from 'axios';

const url = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN;

export const getSessionOccurrences = async () => {
  try {
    const response = await axios.get(`${url}/session-occurrence`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Session Occurrence:", error);
    throw error;
  }
};

export const getSessions = async (sessionId: number) => {
  try {
    const response = await axios.get(`${url}/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Session Details:", error);
    throw error;
  }
};
