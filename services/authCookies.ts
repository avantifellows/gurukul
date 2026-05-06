import { deleteCookie } from 'cookies-next';

const COOKIE_DOMAIN = '.avantifellows.org';

export function isLocalHostname(hostname?: string): boolean {
    if (!hostname) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname === '::1' || hostname === '0.0.0.0') return true;
    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

export function getAuthCookieOptions(): { path: string; domain?: string } {
    const options: { path: string; domain?: string } = { path: '/' };

    if (typeof window !== 'undefined' && !isLocalHostname(window.location.hostname)) {
        options.domain = COOKIE_DOMAIN;
    }

    return options;
}

export function clearAuthCookies() {
    deleteCookie('access_token', { path: '/' });
    deleteCookie('refresh_token', { path: '/' });

    const scopedOptions = getAuthCookieOptions();
    if (!scopedOptions.domain) return;

    deleteCookie('access_token', scopedOptions);
    deleteCookie('refresh_token', scopedOptions);
}
