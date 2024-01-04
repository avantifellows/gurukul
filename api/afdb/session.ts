"use server"

import getFetchConfig from '../fetchConfig';

const url = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export const getGroupUser = async (userDbId: number) => {
  try {
    const queryParams = new URLSearchParams({
      user_id: userDbId.toString(),
    });

    const urlWithParams = `${url}/group-user?${queryParams.toString()}`;
    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching Session Details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetching Session Details:", error);
    throw error;
  }
};


export const getGroupSessions = async (groupTypeId: number) => {
  try {
    const queryParams = new URLSearchParams({
      group_type_id: groupTypeId.toString(),
    });

    const urlWithParams = `${url}/group-session?${queryParams.toString()}`;
    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching Session Details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetching Session Details:", error);
    throw error;
  }
};

export const getSessions = async (sessionId: number) => {
  try {
    const urlWithParams = `${url}/session/${sessionId}`;
    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching Session Details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetching Session Details:", error);
    throw error;
  }
};

