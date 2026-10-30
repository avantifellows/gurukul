const getFetchConfig = (bearerToken: string, additionalHeaders?: Record<string, string>): RequestInit => {
    const defaultHeaders = {
        'Authorization': `Bearer ${bearerToken}`,
        'Accept': 'application/json'
    };

    const mergedHeaders = {
        ...defaultHeaders,
        ...(additionalHeaders || {}),
    };

    return {
        headers: new Headers(mergedHeaders),
        // Next caches fetch indefinitely by default, so a resource renamed or
        // retired in the CMS would keep showing the old version until the next
        // deploy. These reads are all live data; five minutes keeps the cache
        // worth having without content changes going unnoticed.
        next: { revalidate: 300 },
    };
};

export default getFetchConfig;
