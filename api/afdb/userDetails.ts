"use server";

import getFetchConfig from '../fetchConfig';
import { Student, User, UserDetails } from '@/app/types';

export const getUserDetails = async (
    user_id: string,
    group?: string | null
): Promise<UserDetails | null> => {
    const url = process.env.AF_DB_SERVICE_URL;
    const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN!;

    try {
        const isTeacherGroup = Boolean(group && group.toLowerCase().includes('teacher'));
        const endpoint = isTeacherGroup ? 'teacher' : 'student';
        const queryParams = new URLSearchParams({ user_id });
        const urlWithParams = `${url}/${endpoint}?${queryParams.toString()}`;
        const response = await fetch(urlWithParams, getFetchConfig(bearerToken));

        if (!response.ok) {
            throw new Error(`Error fetching ${endpoint} data: ${response.statusText}`);
        }

        if (isTeacherGroup) {
            const data: Array<{ user: User | null }> = await response.json();
            const teacher = data[0] ?? null;
            if (!teacher || !teacher.user) {
                const groupInfo = group ? `, group: ${group}` : '';
                console.warn(`No teacher found for user id: ${user_id}${groupInfo}`);
                return null;
            }
            return { user: teacher.user };
        }

        const data: Student[] = await response.json();
        const student = data[0] ?? null;

        if (!student || !student.user) {
            const groupInfo = group ? `, group: ${group}` : '';
            console.warn(`No student found for user id: ${user_id}${groupInfo}`);
            return null;
        }

        return { user: student.user, student };
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
};
