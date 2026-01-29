"use server";

import getFetchConfig from '../fetchConfig';
import { Student } from '@/app/types';

export const getUserDetails = async (
    id: string,
    group: string
): Promise<Student | null> => {
    const url = process.env.AF_DB_SERVICE_URL;
    const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN!;

    try {
        let urlWithParams: string;

        if (group === 'TNTeachers' || group === 'PunjabTeachers') {
            urlWithParams = `${url}/teacher?teacher_id=${id}`;
        } else {
            const queryParams = new URLSearchParams({
                id,
                group,
            });
            urlWithParams = `${url}/student?${queryParams.toString()}`;
        }

        const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

        if (!response.ok) {
            throw new Error(`Error fetching user data: ${response.statusText}`);
        }

        const data: Student[] = await response.json();

        if (data.length === 0) {
            console.warn(`No user found for id: ${id}, group: ${group}`);
            return null;
        }

        return data[0];
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};
