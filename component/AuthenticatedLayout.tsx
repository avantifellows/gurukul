"use client"

import React, { useEffect, useState } from 'react';
import { verifyToken } from '@/services/validation';

interface AuthenticatedLayoutProps {
    children: React.ReactNode;
}

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    const [verificationResult, setVerificationResult] = useState({
        isValid: false,
        message: '',
        data: undefined,
    });

    useEffect(() => {
        verifyToken()
            .then((result) => {
                setVerificationResult({
                    isValid: result.isValid,
                    message: result.message || 'No message available',
                    data: result.data || undefined,
                });
            })
            .catch((error) => {
                console.error('Error verifying token:', error);
                throw error;
            });
    }, []);

    if (verificationResult === null) {
        return <p>Verifying token...</p>;
    } else if (verificationResult.isValid) {
        return children;
    } else {
        return <p>{verificationResult.message}</p>;
    }
}

export default AuthenticatedLayout;
