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
import { navigateToPortal, clearPWACache } from '@/utils/navigation';

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
                    const userGroup = result.data.data.group;
                    const verifiedId = result.data.id;
                    setUserId(verifiedId);
                    setGroup(userGroup);

                    // Fetch user details
                    const userData: Student | null = await getUserDetails(verifiedId, userGroup);
                    if (userData) {
                        setUser(userData.user);

                        const mixpanel = MixpanelTracking.getInstance();
                        const userProperties = {
                            auth_group: userGroup,
                            grade_id: userData.grade_id,
                            stream: userData.stream,
                            gender: userData.user.gender,
                            category: userData.category,
                        };

                        // Check if this is a fresh login or session restoration
                        if (mixpanel.hasUserLoginBeenTracked(verifiedId)) {
                            // Session restoration - just identify without tracking event
                            mixpanel.identifyUser(verifiedId, userProperties);
                        } else {
                            // Fresh login - track the login event
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

    const logout = async () => {
        try {
            // Clear the login tracking flag so next login will be tracked
            MixpanelTracking.getInstance().clearUserLoginTracked(userId);
            // Reset Mixpanel user data
            MixpanelTracking.getInstance().reset();
            
            // Clear local storage
            localStorage.clear();
            sessionStorage.clear();
            
            // Clear PWA cache (non-blocking)
            clearPWACache().catch(console.error);
            
            // Update state
            setLoggedIn(false);
            setUserId(null);
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
        <AuthContext.Provider value={{ loggedIn, userId, userName, userDbId, group, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}