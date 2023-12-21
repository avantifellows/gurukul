"use server"

import axios from 'axios';
import getAxiosConfig from '../axiosConfig';

export const getUserName = async (studentId: string): Promise<string | null> => {
    const url = process.env.AF_DB_SERVICE_URL;
    const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN!;

    try {
        const response = await axios.get(`${url}/student`, {
            params: { student_id: studentId },
            ...getAxiosConfig(bearerToken),
        });

        if (response.data.length === 0) {
            console.warn(`No user found for student ID: ${studentId}`);
            return null;
        }

        const firstName = response.data[0].user.first_name;
        const lastName = response.data[0].user.last_name;
        return `${firstName} ${lastName}`;
    } catch (error) {
        console.error('Error fetching student data:', error);
        throw error;
    }
}
