import axios from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { api } from './url';

export async function verifyToken() {
    const accessToken = getCookie('access_token');
    const refreshToken = getCookie('refresh_token');
    const url = `${api.portal.backend.baseUrl}${api.portal.backend.verify}`;
    const refreshUrl = `${api.portal.backend.baseUrl}${api.portal.backend.refreshToken}`;

    if (!accessToken) {
        return { isValid: false, message: 'Access token not found' };
    }

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return { isValid: true, data: response.data };
    } catch (error: any) {
        if (error.response.data.detail === "Signature has expired" && refreshToken) {
            try {
                const refreshResponse = await axios.post(refreshUrl, {}, {
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                    },
                });

                setCookie('access_token', refreshResponse.data.access_token);

                return { isValid: true };
            } catch (refreshError) {
                return { isValid: false, message: 'Error refreshing token', refreshError };
            }
        }

        return { isValid: false, message: error };
    }
}
