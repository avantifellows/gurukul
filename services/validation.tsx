import axios from 'axios';

export async function verifyToken() {
    const token = localStorage.getItem('access_token');
    const url = `${process.env.NEXT_PUBLIC_AF_PORTAL_BACKEND_URL}/verify`;

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
        return { isValid: false, message: 'Token invalid' };
    }
}