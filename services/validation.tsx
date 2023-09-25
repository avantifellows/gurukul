import axios from 'axios';
import { getCookie } from 'cookies-next';
import { api } from './url';

export async function verifyToken() {
    const token = getCookie('access_token');
    const url = `${api.portal.backend.baseUrl}${api.portal.backend.verify}`;

    if (!token) {
        return { isValid: false, message: 'Token not found' };
    }

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return { isValid: true, data: response.data };
        
    } catch (error) {
        return { isValid: false, message: error };
    }
}
