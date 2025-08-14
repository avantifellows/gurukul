import mixpanel from "mixpanel-browser";

export class MixpanelTracking {
    private static _instance: MixpanelTracking;

    public static getInstance(): MixpanelTracking {
        if (!MixpanelTracking._instance) {
            MixpanelTracking._instance = new MixpanelTracking();
        }
        return MixpanelTracking._instance;
    }

    private constructor() {
        mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '', {
            debug: process.env.NODE_ENV === 'development',
            track_pageview: false,
            autotrack: false,
            persistence: 'localStorage'
        });
    }

    public trackEvent = (eventName: string, properties?: Record<string, any>) => {
        mixpanel.track(eventName, properties);
    };

    public identify = (userId: string) => {
        mixpanel.identify(userId);
    };

    public setUserProperties = (properties: Record<string, any>) => {
        mixpanel.people.set(properties);
    };

    // Just identify user without tracking event (for session restoration)
    public identifyUser = (userId: string, properties: Record<string, any>) => {
        this.identify(userId);
        this.setUserProperties(properties);
    };

    // Track login event only on actual login (not session restoration)
    public trackUserLogin = (userId: string, eventName: string, properties: Record<string, any>) => {
        this.identify(userId);
        this.setUserProperties(properties);
        this.trackEvent(eventName, properties);

        // Set flag to prevent tracking on subsequent app launches
        this.setUserLoginTracked(userId);
    };

    // Check if user login has already been tracked for this login session
    public hasUserLoginBeenTracked = (userId: string): boolean => {
        try {
            const loginKey = `mp_user_${userId}_login_tracked`;
            return localStorage.getItem(loginKey) === '1';
        } catch {
            return false;
        }
    };

    private setUserLoginTracked = (userId: string) => {
        try {
            const loginKey = `mp_user_${userId}_login_tracked`;
            localStorage.setItem(loginKey, '1');
        } catch {
            // Ignore storage errors
        }
    };

    // Clear the login tracking flag (call this on logout)
    public clearUserLoginTracked = (userId: string | null) => {
        if (!userId) return;
        try {
            const loginKey = `mp_user_${userId}_login_tracked`;
            localStorage.removeItem(loginKey);
        } catch {
            // Ignore storage errors
        }
    };

    public reset = () => {
        mixpanel.reset();
    };
}