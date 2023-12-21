"use server"

import axios from 'axios';
import getAxiosConfig from '../axiosConfig';

export async function getUserName(studentId: string): Promise<string> {
    const url = process.env.AF_DB_SERVICE_URL;
    const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN!;

    try {
        const response = await axios.get(`${url}/student`, {
            params: { student_id: studentId },
            ...getAxiosConfig(bearerToken),
        });

        const firstName = response.data[0].user.first_name;
        const lastName = response.data[0].user.last_name;
        return `${firstName} ${lastName}`;
    } catch (error) {
        console.error('Error fetching student data:', error);
        throw error;
    }
}
