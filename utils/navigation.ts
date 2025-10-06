export const navigateToPortal = (url: string) => {
    // Check if running in PWA standalone mode
    const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');

    if (isStandalone) {
        // In PWA mode: open in system browser to break out of PWA context
        // This allows proper navigation to Portal
        window.open(url, '_system') || window.open(url, '_blank');
    } else {
        // In regular browser: normal navigation
        window.location.href = url;
    }
};

export const clearPWACache = async () => {
    try {
        // Clear all caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
        }
    } catch (error) {
        console.error('Failed to clear PWA cache:', error);
    }
};