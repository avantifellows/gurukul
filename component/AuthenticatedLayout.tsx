"use client";

import React, { useEffect, useState } from 'react';
import { verifyToken } from '@/services/validation';
import { useRouter } from 'next/navigation';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const router = useRouter();
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

                if (!result.isValid) {
                    router.back();
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                throw error;
            }
        }

        checkToken();
    }, [router]);

    if (!verificationResult.isValid) {
        return <p className="flex flex-col items-center p-24">{verificationResult.message}</p>;
    }

    return (
        <div className="min-h-screen">
            <main>{children}</main>
        </div>
    );
}

export default AuthenticatedLayout;
