"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '@/services/validation';
import { usePathname, useRouter } from 'next/navigation';
import {
    AuthContextProps,
    ResolvedTokenIdentity,
    Student,
    TokenProfile,
    User,
    UserDetails,
} from '../app/types';
import { api } from '@/services/url';
import { getUserDetails } from '@/api/afdb/userDetails';
import { getGroupConfig } from '@/config/groupConfig';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';
import { navigateToPortal, clearPWACache } from '@/utils/navigation';
import { clearAuthCookies } from '@/services/authCookies';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within the AuthProvider');
    }
    return context;
}

const buildUserFromProfile = (profileUser: any, verifiedId: string | null): User | null => {
    if (!profileUser || typeof profileUser !== 'object') return null;

    const derivedName = getTrimmedString(profileUser.name);
    const firstName = getTrimmedString(profileUser.first_name) || derivedName;
    const lastName = getTrimmedString(profileUser.last_name);
    const numericId = verifiedId ? Number(verifiedId) : NaN;

    return {
        id: Number.isNaN(numericId) ? 0 : numericId,
        first_name: firstName || '',
        last_name: lastName,
        gender:
            typeof profileUser.gender === 'string' ? profileUser.gender : undefined,
    };
};

const getTrimmedString = (value: unknown): string => {
    return typeof value === 'string' ? value.trim() : '';
};

const toStringOrNull = (value: unknown): string | null => {
    return value ? String(value) : null;
};

const isObject = (value: unknown): value is Record<string, any> => {
    return Boolean(value && typeof value === 'object');
};

const resolveTokenIdentity = (result: any): ResolvedTokenIdentity => {
    const tokenData = result.data?.data ?? {};
    const profile = isObject(tokenData.profile) ? tokenData.profile : null;
    const studentProfile = isObject(profile?.student) ? profile.student : null;

    return {
        userId: toStringOrNull(tokenData.user_id ?? result.data?.id),
        group: tokenData.group ?? null,
        displayId: toStringOrNull(tokenData.display_id),
        studentId: toStringOrNull(tokenData.student_id ?? studentProfile?.student_id),
        apaarId: toStringOrNull(tokenData.apaar_id ?? studentProfile?.apaar_id),
        profile,
    };
};

const buildUserDetailsFromProfile = (
    profile: TokenProfile,
    verifiedId: string
): UserDetails => {
    const user = buildUserFromProfile(profile.user, verifiedId) || {
        id: Number(verifiedId),
        first_name: '',
        last_name: '',
    };
    const profileStudent = isObject(profile.student) ? profile.student : null;
    const student: Student | null = profileStudent
        ? {
              id: Number(profileStudent.id ?? 0),
              student_id: toStringOrNull(profileStudent.student_id),
              user,
              stream:
                  typeof profileStudent.stream === 'string'
                      ? profileStudent.stream
                      : undefined,
              grade_id:
                  typeof profileStudent.grade_id === 'number'
                      ? profileStudent.grade_id
                      : undefined,
              category:
                  typeof profileStudent.category === 'string'
                      ? profileStudent.category
                      : undefined,
          }
        : null;

    return {
        user,
        student,
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

    const clearIdentityState = () => {
        setUserId(null);
        setStudentId(null);
        setApaarId(null);
        setDisplayId(null);
    };

    const redirectToPortal = (targetGroup?: string) => {
        const redirectGroup = targetGroup || group || 'DelhiStudents';
        const portalUrl = `${api.portal.frontend.baseUrl}/?group=${redirectGroup}&platform=gurukul`;
        navigateToPortal(portalUrl);
    };

    useEffect(() => {
        async function checkToken() {
            try {
                const result = await verifyToken();

                if (result.isValid) {
                    setLoggedIn(true);

                    const identity = resolveTokenIdentity(result);

                    setUserId(identity.userId);
                    setStudentId(identity.studentId);
                    setApaarId(identity.apaarId);
                    setDisplayId(identity.displayId);
                    setGroup(identity.group);

                    if (!identity.userId || !identity.group) {
                        console.warn('Token verification missing identifiers, redirecting to portal');
                        setLoggedIn(false);
                        clearIdentityState();
                        redirectToPortal();
                        return;
                    }

                    const userDetails = identity.profile
                        ? buildUserDetailsFromProfile(identity.profile, identity.userId)
                        : await getUserDetails(identity.userId, identity.group);

                    if (userDetails?.user) {
                        setUser(userDetails.user);
                        const studentInfo = userDetails.student;

                        const mixpanel = MixpanelTracking.getInstance();
                        const userProperties = {
                            auth_group: identity.group,
                            grade_id: studentInfo?.grade_id,
                            stream: studentInfo?.stream,
                            gender: userDetails.user.gender,
                            category: studentInfo?.category,
                        };

                        if (mixpanel.hasUserLoginBeenTracked(identity.userId)) {
                            mixpanel.identifyUser(identity.userId, userProperties);
                        } else {
                            mixpanel.trackUserLogin(identity.userId, MIXPANEL_EVENT.USER_IDENTIFIED, userProperties);
                        }
                    }

                    // Redirect users to library based on group configuration
                    const config = getGroupConfig(identity.group);
                    if (pathname === '/' && config.showHomeTab === false) {
                        router.replace('/library');
                    }
                } else {
                    setLoggedIn(false);
                    clearIdentityState();
                    redirectToPortal();
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                setLoggedIn(false);
                clearIdentityState();
            } finally {
                setIsLoading(false);
            }
        }

        checkToken();
    }, []);

    const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

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
            clearIdentityState();
            setUser(null);
            
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
