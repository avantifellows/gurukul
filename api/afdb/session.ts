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

export const getGroupTypes = async (groupTypeId: number) => {
  try {
    const queryParams = new URLSearchParams({
      id: groupTypeId.toString(),
      type: "batch"
    });
    const urlWithParams = `${url}/group-type?${queryParams.toString()}`;
    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching Group Type Details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetching Group Type Details:", error);
    throw error;
  }
};

export const getQuizBatchData = async (id: number) => {
  try {
    const urlWithParams = `${url}/batch/${id}`;
    const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

    if (!response.ok) {
      throw new Error(`Error in fetching Batch Details: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in fetching Batch Details:", error);
    throw error;
  }
};
