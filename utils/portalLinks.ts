import { api } from '@/services/url';
import { GURUKUL_SOURCE_PARAM } from '@/constants/config';

type PortalParam = string | number | boolean | null | undefined;

export function buildGurukulPortalUrl(
    params: Record<string, PortalParam> = {},
    options: { includePlatform?: boolean } = {}
): string {
    const baseUrl = api.portal.frontend.baseUrl;
    const queryParams = new URLSearchParams();
    const platformParams = options.includePlatform === false ? {} : { platform: 'gurukul' };

    Object.entries({ ...GURUKUL_SOURCE_PARAM, ...platformParams, ...params }).forEach(([key, value]) => {
        if (value === null || value === undefined) return;
        queryParams.set(key, String(value));
    });

    if (!baseUrl) {
        return `/?${queryParams.toString()}`;
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${queryParams.toString()}`;
}

export function buildGurukulSessionUrl(
    sessionId: string | number,
    params: Record<string, PortalParam> = {}
): string {
    return buildGurukulPortalUrl({
        sessionId,
        ...params,
    }, { includePlatform: false });
}
