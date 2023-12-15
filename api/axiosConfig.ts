import { AxiosRequestConfig } from 'axios';

interface AdditionalHeaders {
    [key: string]: string;
}

const getAxiosConfig = (bearerToken: string, additionalHeaders?: AdditionalHeaders): AxiosRequestConfig => {
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
