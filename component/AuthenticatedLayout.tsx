"use client";

import React, { useEffect, useState } from 'react';
import { verifyToken } from '@/services/validation';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const [verificationResult, setVerificationResult] = useState<{
        isValid: boolean;
        message: string;
        data?: any;
    }>({
        isValid: false,
        message: 'Verifying token...',
    });

    useEffect(() => {
        async function checkToken() {
            try {
                const result = await verifyToken();
                setVerificationResult({
                    isValid: result.isValid,
                    message: result.message || 'No message available',
                    data: result.data,
                });
            } catch (error) {
                console.error('Error verifying token:', error);
                throw error;
            }
        }

        checkToken();
    }, []);

    if (!verificationResult.isValid) {
        return <p>{verificationResult.message}</p>;
    }

    return (
        <div className="min-h-screen">
            <main>{children}</main>
        </div>
    );
}

export default AuthenticatedLayout;
