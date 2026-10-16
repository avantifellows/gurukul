"use server";

import getFetchConfig from '../fetchConfig';
import { GroupConfig } from '@/app/types';
import { requireSession } from '@/api/auth/requireSession';

/**
 * Fetches the resolved Gurukul UI configuration for a user from db-service.
 *
 * db-service resolves the config along the fallback chain
 * `defaultgroup <- program <- batch` (later layers win) based on the user's
 * oldest current batch/program enrollment.
 *
 * Returns a partial config containing only the keys configured on the backend.
 * Callers overlay it on the hardcoded group defaults, so an empty response (or
 * a failure) simply leaves the existing defaults in place.
 */
export const fetchGurukulConfig = async (
    _userId?: string
): Promise<Partial<GroupConfig>> => {
    const url = process.env.AF_DB_SERVICE_URL;
    const bearerToken = process.env.AF_DB_SERVICE_BEARER_TOKEN!;

    try {
        // Identity comes from the verified session, not the caller, so the
        // config returned is always the signed-in user's own. An unauthenticated
        // call throws here and is caught below, leaving the defaults in place.
        const { userId } = await requireSession();
        const queryParams = new URLSearchParams({ user_id: userId });
        const urlWithParams = `${url}/gurukul-config?${queryParams.toString()}`;
        const response = await fetch(urlWithParams, {
            ...getFetchConfig(bearerToken),
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`Error fetching gurukul config: ${response.statusText}`);
        }

        const data: { config?: Partial<GroupConfig> | null } = await response.json();
        return data.config ?? {};
    } catch (error) {
        console.error('Error fetching gurukul config:', error);
        return {};
    }
};
