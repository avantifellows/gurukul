const getFetchConfig = (bearerToken: string, additionalHeaders?: Record<string, string>): RequestInit => {
    const defaultHeaders = {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json',
        'cache': 'force-cache'
    };

    const mergedHeaders = {
        ...defaultHeaders,
        ...(additionalHeaders || {}),
    };

    return {
        headers: new Headers(mergedHeaders),
    };
};

export default getFetchConfig;
