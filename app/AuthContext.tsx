"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyToken } from '@/services/validation';
import { useRouter } from 'next/navigation';
import { api } from '@/services/url';

interface AuthContextProps {
    loggedIn: boolean;
    userId?: string | null;
}

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

    useEffect(() => {
        async function checkToken() {
            try {
                const result = await verifyToken();
                if (result.isValid) {
                    setLoggedIn(true);
                    setUserId(result.data.id);
                } else {
                    setLoggedIn(false);
                    setUserId(null);
                    router.push(`${api.portal.frontend.baseUrl}`);
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                setLoggedIn(false);
                setUserId(null);
            }
        }

        checkToken();
    }, []);

    return (
        <AuthContext.Provider value={{ loggedIn, userId }}>
            {children}
        </AuthContext.Provider>
    );
}
