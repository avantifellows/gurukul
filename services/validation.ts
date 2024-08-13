import { getCookie, setCookie } from 'cookies-next';
import { api } from './url';
import getFetchConfig from '@/api/fetchConfig';

async function getToken(key: string): Promise<string | null> {
    let token: string | null = getCookie(key) as string | null;
    if (!token) {
        token = localStorage.getItem(key);
    }
    if (token) {
        localStorage.setItem(key, token);
    }
    return token;
}

export async function verifyToken() {
    try {
        const accessToken = await getToken('access_token');
        const refreshToken = await getToken('refresh_token');
        const url = api.portal.backend.baseUrl + api.portal.backend.verify;
        const refreshUrl = api.portal.backend.baseUrl + api.portal.backend.refreshToken;

        if (!accessToken) {
            return { isValid: false, message: 'Access token not found' };
        }

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
                localStorage.setItem('access_token', refreshData.access_token);
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
