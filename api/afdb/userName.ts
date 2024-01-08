"use server";

import getFetchConfig from '../fetchConfig';
import { Student, User } from '@/app/types';

export const getUserName = async (studentId: string): Promise<User | null> => {
    const url = process.env.AF_DB_SERVICE_URL;
    const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN!;

    try {
        const queryParams = new URLSearchParams({
            student_id: studentId,
        });

        const urlWithParams = `${url}/student?${queryParams.toString()}`;
        const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

        if (!response.ok) {
            throw new Error(`Error fetching student data: ${response.statusText}`);
        }

        const data: Student[] = await response.json();

        if (data.length === 0) {
            console.warn(`No user found for student ID: ${studentId}`);
            return null;
        }

        return data[0].user;
    } catch (error) {
        console.error('Error fetching student data:', error);
        throw error;
    }
};
