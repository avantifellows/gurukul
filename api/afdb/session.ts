"use server"

import axios from 'axios';
import getAxiosConfig from '../axiosConfig';

const url = process.env.AF_DB_SERVICE_URL;
const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN || '';

export const getGroupUser = async (userDbId: number) => {
  try {
    const response = await axios.get(`${url}/group-user`, {
      params: { user_id: userDbId },
      ...getAxiosConfig(bearerToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Session Details:", error);
    throw error;
  }
};

export const getGroupSessions = async (groupTypeId: number) => {
  try {
    const response = await axios.get(`${url}/group-session`, {
      params: { group_type_id: groupTypeId },
      ...getAxiosConfig(bearerToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Session Details:", error);
    throw error;
  }
};

export const getSessions = async (sessionId: number) => {
  try {
    const response = await axios.get(`${url}/session/${sessionId}`, {
      ...getAxiosConfig(bearerToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Session Details:", error);
    throw error;
  }
};

export const getGroupTypes = async (groupTypeId: number) => {
  try {
    const response = await axios.get(`${url}/group-type`, {
      params: { id: groupTypeId, type: "batch" },
      ...getAxiosConfig(bearerToken),
    });
    return response.data;
  } catch (error) {
    console.error("Error in fetching Group Types:", error);
    throw error;
  }
};
