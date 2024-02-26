import mixpanel from "mixpanel-browser";

export class MixpanelTracking {

    private static _instance: MixpanelTracking;

    public static getInstance(): MixpanelTracking {
        if (MixpanelTracking._instance == null) {
            return (MixpanelTracking._instance = new MixpanelTracking());
        }
        return this._instance;
    }

    public constructor() {
        if (MixpanelTracking._instance) {
            throw new Error('Error: Instance creation of MixpanelTracking is not allowed. Use Mixpanel.getInstance instead.')
        }
        mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '', {
            debug: true, track_pageview: true, persistence: 'localStorage'
        })
    }

    public trackEvent = (eventName: string, properties?: Record<string, any>) => {
        mixpanel.track(eventName, properties);
    };

    public identify = (userId: string) => {
        mixpanel.identify(userId);
    };
}
