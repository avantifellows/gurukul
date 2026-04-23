import { getCookie, setCookie } from 'cookies-next';
import { api } from './url';
import getFetchConfig from '@/api/fetchConfig';

const COOKIE_DOMAIN = '.avantifellows.org';

async function getToken(key: string): Promise<string | null> {
    return getCookie(key) as string | null;
}

function isLocalHostname(hostname?: string): boolean {
    if (!hostname) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname === '::1' || hostname === '0.0.0.0') return true;
    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
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
                const cookieOptions: { path: string; domain?: string } = { path: '/' };
                if (typeof window !== 'undefined' && !isLocalHostname(window.location.hostname)) {
                    cookieOptions.domain = COOKIE_DOMAIN;
                }
                setCookie('access_token', refreshData.access_token, cookieOptions);
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
