import * as amplitude from "@amplitude/analytics-browser";

// Initialize Amplitude with API key
export const initAnalytics = (userId?: string) => {
  const apiKey = import.meta.env.VITE_AMPLITUDE_API_KEY;

  if (!apiKey) {
    console.warn("Amplitude API key not configured");
    return;
  }

  amplitude.init(apiKey, {
    defaultTracking: false,
  });

  if (userId) {
    amplitude.setUserId(userId);
  }
};

// Set user ID after authentication
export const setAnalyticsUserId = (userId: string) => {
  amplitude.setUserId(userId);
};

// Track events
export const trackEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  amplitude.track(eventName, properties);
};
