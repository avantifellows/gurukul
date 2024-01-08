import { getCookie, setCookie } from 'cookies-next';
import { api } from './url';
import getFetchConfig from '@/api/fetchConfig';

export async function verifyToken() {
    const accessToken = getCookie('access_token');
    const refreshToken = getCookie('refresh_token');
    const url = `${api.portal.backend.baseUrl}${api.portal.backend.verify}`;
    const refreshUrl = `${api.portal.backend.baseUrl}${api.portal.backend.refreshToken}`;

    if (!accessToken) {
        return { isValid: false, message: 'Access token not found' };
    }

    try {
        const response = await fetch(url, getFetchConfig(accessToken));
        const data = await response.json();

        if (!response.ok) {
            if (refreshToken && data.detail === "Signature has expired") {
                const refreshResponse = await fetch(refreshUrl, {
                    method: 'POST',
                    ...getFetchConfig(refreshToken),
                });

                if (!refreshResponse.ok) {
                    throw new Error(`Error refreshing token: ${refreshResponse.statusText}`);
                }

                const refreshData = await refreshResponse.json();
                setCookie('access_token', refreshData.access_token, { path: '/', domain: '.avantifellows.org' });
                window.location.reload();
                return { isValid: true };
            }

            throw new Error(`Error verifying token: ${response.statusText}`);
        }

        return { isValid: true, data };

    } catch (error) {
        return { isValid: false, message: error || 'Unknown error occurred' };
    }
}
