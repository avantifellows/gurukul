import { AxiosRequestConfig } from 'axios';
import { AxiosAdditionalHeaders } from '@/app/types';

const getAxiosConfig = (bearerToken: string, additionalHeaders?: AxiosAdditionalHeaders): AxiosRequestConfig => {
    const defaultHeaders = {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json',
    };

    const mergedHeaders = {
        ...defaultHeaders,
        ...(additionalHeaders || {}),
    };

    return {
        headers: mergedHeaders,
    };
};

export default getAxiosConfig;
