"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { deleteCookie } from 'cookies-next';
import { verifyToken } from '@/services/validation';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContextProps, User, UserDetails } from '../app/types';
import { api } from '@/services/url';
import { getUserDetails } from '@/api/afdb/userDetails';
import { getGroupConfig } from '@/config/groupConfig';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';
import { navigateToPortal, clearPWACache } from '@/utils/navigation';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);
const COOKIE_DOMAIN = '.avantifellows.org';

const isLocalHostname = (hostname?: string) => {
    if (!hostname) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (hostname === '::1' || hostname === '0.0.0.0') return true;
    return /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
};

const clearAuthCookies = () => {
    deleteCookie('access_token', { path: '/' });
    deleteCookie('refresh_token', { path: '/' });

    if (typeof window === 'undefined') return;
    if (isLocalHostname(window.location.hostname)) return;

    deleteCookie('access_token', { path: '/', domain: COOKIE_DOMAIN });
    deleteCookie('refresh_token', { path: '/', domain: COOKIE_DOMAIN });
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within the AuthProvider');
    }
    return context;
}

const buildUserFromProfile = (profileUser: any, verifiedId: string | null): User | null => {
    if (!profileUser || typeof profileUser !== 'object') return null;

    const derivedName =
        typeof profileUser.name === 'string' ? profileUser.name.trim() : '';
    const firstName =
        typeof profileUser.first_name === 'string' && profileUser.first_name.trim()
            ? profileUser.first_name.trim()
            : derivedName;
    const lastName =
        typeof profileUser.last_name === 'string' ? profileUser.last_name.trim() : '';
    const numericId = verifiedId ? Number(verifiedId) : NaN;

    return {
        id: Number.isNaN(numericId) ? 0 : numericId,
        first_name: firstName || '',
        last_name: lastName,
        gender:
            typeof profileUser.gender === 'string' ? profileUser.gender : undefined,
    };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [displayId, setDisplayId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [group, setGroup] = useState<string | null>(null);
    const [studentId, setStudentId] = useState<string | null>(null);
    const [apaarId, setApaarId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const redirectToPortal = (targetGroup?: string) => {
        const redirectGroup = targetGroup || group || 'DelhiStudents';
        const portalUrl = `${api.portal.frontend.baseUrl}/?group=${redirectGroup}&platform=gurukul&source=gurukul`;
        navigateToPortal(portalUrl);
    };

    useEffect(() => {
        async function checkToken() {
            try {
                const result = await verifyToken();

                if (result.isValid) {
                    setLoggedIn(true);

                    const tokenData = result.data?.data ?? {};
                    const userGroup = tokenData.group ?? null;
                    const verifiedIdRaw = tokenData.user_id ?? result.data?.id ?? null;
                    const verifiedId = verifiedIdRaw ? String(verifiedIdRaw) : null;
                    const resolvedStudentId = tokenData.student_id
                        ? String(tokenData.student_id)
                        : null;
                    const resolvedApaarId = tokenData.apaar_id
                        ? String(tokenData.apaar_id)
                        : null;
                    const resolvedDisplayId = tokenData.display_id
                        ? String(tokenData.display_id)
                        : null;
                    const tokenProfile =
                        tokenData.profile && typeof tokenData.profile === 'object'
                            ? tokenData.profile
                            : null;

                    setUserId(verifiedId);
                    setStudentId(
                        resolvedStudentId ??
                            (tokenProfile?.student?.student_id
                                ? String(tokenProfile.student.student_id)
                                : null)
                    );
                    setApaarId(
                        resolvedApaarId ??
                            (tokenProfile?.student?.apaar_id
                                ? String(tokenProfile.student.apaar_id)
                                : null)
                    );
                    setDisplayId(resolvedDisplayId);
                    setGroup(userGroup);

                    if (!verifiedId || !userGroup) {
                        console.warn('Token verification missing identifiers, redirecting to portal');
                        setLoggedIn(false);
                        setUserId(null);
                        setStudentId(null);
                        setApaarId(null);
                        setDisplayId(null);
                        redirectToPortal();
                        return;
                    }

                    let userData: UserDetails | null = null;
                    if (tokenProfile) {
                        userData = {
                            user: buildUserFromProfile(tokenProfile.user, verifiedId) || {
                                id: Number(verifiedId),
                                first_name: '',
                                last_name: '',
                            },
                            student:
                                tokenProfile.student && typeof tokenProfile.student === 'object'
                                    ? tokenProfile.student
                                    : null,
                        };
                    } else {
                        userData = await getUserDetails(verifiedId, userGroup);
                    }

                    if (userData?.user) {
                        setUser(userData.user);
                        const studentInfo = userData.student;

                        const mixpanel = MixpanelTracking.getInstance();
                        const userProperties = {
                            auth_group: userGroup,
                            grade_id: studentInfo?.grade_id,
                            stream: studentInfo?.stream,
                            gender: userData.user.gender,
                            category: studentInfo?.category,
                        };

                        if (mixpanel.hasUserLoginBeenTracked(verifiedId)) {
                            mixpanel.identifyUser(verifiedId, userProperties);
                        } else {
                            mixpanel.trackUserLogin(verifiedId, MIXPANEL_EVENT.USER_IDENTIFIED, userProperties);
                        }
                    }

                    // Redirect users to library based on group configuration
                    const config = getGroupConfig(userGroup);
                    if (pathname === '/' && config.showHomeTab === false) {
                        router.replace('/library');
                    }
                } else {
                    setLoggedIn(false);
                    setUserId(null);
                    setStudentId(null);
                    setApaarId(null);
                    setDisplayId(null);
                    redirectToPortal();
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                setLoggedIn(false);
                setUserId(null);
                setStudentId(null);
                setApaarId(null);
                setDisplayId(null);
            } finally {
                setIsLoading(false);
            }
        }

        checkToken();
    }, []);

    const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    const userDbId = user ? user.id : null;

    const logout = async () => {
        try {
            // Clear the login tracking flag so next login will be tracked
            MixpanelTracking.getInstance().clearUserLoginTracked(userId);
            // Reset Mixpanel user data
            MixpanelTracking.getInstance().reset();
            
            clearAuthCookies();
            // Clear local storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear PWA cache (non-blocking)
            clearPWACache().catch(console.error);
            
            // Update state
            setLoggedIn(false);
            setUserId(null);
            setUser(null);
            setStudentId(null);
            setApaarId(null);
            setDisplayId(null);
            
            // Redirect to portal (this will open in system browser if in PWA)
            redirectToPortal();
        } catch (error) {
            console.error('Logout error:', error);
            // Still try to redirect even if cleanup fails
            redirectToPortal();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                loggedIn,
                userId,
                displayId,
                userName,
                userDbId,
                group,
                studentId,
                apaarId,
                logout,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
