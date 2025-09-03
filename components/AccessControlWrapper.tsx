"use client"

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/services/AuthContext';
import { getGroupConfig } from '@/config/groupConfig';

interface AccessControlWrapperProps {
    children: React.ReactNode;
    tabName: 'library' | 'reports' | 'home';
}

const AccessControlWrapper: React.FC<AccessControlWrapperProps> = ({ children, tabName }) => {
    const { group } = useAuth();
    const router = useRouter();
    const groupConfig = getGroupConfig(group || 'defaultGroup');

    // Check if the tab should be hidden
    const isTabHidden = () => {
        switch (tabName) {
            case 'library':
                return groupConfig.showLibraryTab === false;
            case 'reports':
                return groupConfig.showReportsTab === false;
            case 'home':
                return groupConfig.showHomeTab === false;
            default:
                return false;
        }
    };

    // Access control: redirect if tab is hidden for this group
    useEffect(() => {
        if (isTabHidden()) {
            router.push('/');
        }
    }, [groupConfig, tabName, router]);

    // Don't render children if tab is hidden
    if (isTabHidden()) {
        return null;
    }

    return <>{children}</>;
};

export default AccessControlWrapper;
