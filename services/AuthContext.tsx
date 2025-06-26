"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '@/services/validation';
import { useRouter } from 'next/navigation';
import { AuthContextProps, User } from '../app/types';
import { api } from '@/services/url';
import { getUserName } from '@/api/afdb/userName';

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
    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [group, setGroup] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkToken() {
            try {
                const result = await verifyToken();
                if (result.isValid) {
                    setLoggedIn(true);
                    const userGroup = result.data.data.group;
                    setUserId(result.data.id);
                    setGroup(userGroup);
                    let userData = null;
                    if (userGroup === "EnableStudents") {
                        userData = await getUserName(result.data.id, 'apaar_id');
                    }
                    if (!userData) {
                        userData = await getUserName(result.data.id, 'student_id');
                    }
                    setUser(userData);
                } else {
                    setLoggedIn(false);
                    setUserId(null);
                    router.push(`${api.portal.frontend.baseUrl}/?group=DelhiStudents&platform=gurukul`);
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
        router.push(`${api.portal.frontend.baseUrl}/?group=${group}&platform=gurukul`);
    };

    return (
        <AuthContext.Provider value={{ loggedIn, userId, userName, userDbId, group, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
