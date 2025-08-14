"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '@/services/validation';
import { usePathname, useRouter } from 'next/navigation';
import { AuthContextProps, User, Student } from '../app/types';
import { api } from '@/services/url';
import { getUserDetails } from '@/api/afdb/userDetails';
import { getGroupConfig } from '@/config/groupConfig';
import { MixpanelTracking } from '@/services/mixpanel';
import { MIXPANEL_EVENT } from '@/constants/config';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within the AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [group, setGroup] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasTrackedUser, setHasTrackedUser] = useState(false);

    const redirectToPortal = (targetGroup?: string) => {
        const redirectGroup = targetGroup || group || 'DelhiStudents';
        router.push(`${api.portal.frontend.baseUrl}/?group=${redirectGroup}&platform=gurukul`);
    };

    const trackUserProperties = (userData: Student, userGroup: string) => {
        const mixpanel = MixpanelTracking.getInstance();

        // Prepare user properties for mixpanel - all the requested fields
        const userProperties = {
            auth_group: userGroup,
            grade_id: userData.grade_id,
            stream: userData.stream,
            gender: userData.user.gender,
            category: userData.category
        };

        // Track user identification event with all demographic properties
        mixpanel.trackEvent(MIXPANEL_EVENT.USER_IDENTIFIED, userProperties);

        // Set user properties in mixpanel for future tracking
        mixpanel.setUserProperties(userProperties);
    };

    useEffect(() => {
        async function checkToken() {
            try {
                const result = await verifyToken();
                if (result.isValid) {
                    setLoggedIn(true);
                    const userGroup = result.data.data.group;
                    setUserId(result.data.id);
                    setGroup(userGroup);

                    // Fetch user details including the fields we want to track
                    const userData = await getUserDetails(result.data.id, userGroup);
                    if (userData) {
                        setUser(userData.user);

                        // Track user properties with mixpanel only once per login session
                        if (!hasTrackedUser) {
                            trackUserProperties(userData, userGroup);
                            setHasTrackedUser(true);
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
                    redirectToPortal();
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                setLoggedIn(false);
                setUserId(null);
            } finally {
                setIsLoading(false);
            }
        }

        checkToken();
    }, []);

    const userName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
    const userDbId = user ? user.id : null;

    const logout = () => {
        setLoggedIn(false);
        setUserId(null);
        setUser(null);
        setHasTrackedUser(false);
        redirectToPortal();
    };

    return (
        <AuthContext.Provider value={{ loggedIn, userId, userName, userDbId, group, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
