import { setUserId as firebaseSetUserId, setUserProperties as firebaseSetUserProperties, logEvent as firebaseLogEvent } from 'firebase/analytics';
import { analyticsPromise } from '../config/firebase';

/**
 * Set the user ID for analytics tracking
 * @param userId - The user's unique identifier
 */
export const setUserId = async (userId: string | null): Promise<void> => {
  const analytics = await analyticsPromise;
  if (analytics) {
    firebaseSetUserId(analytics, userId);
  }
};

/**
 * Set user properties for analytics segmentation
 * @param properties - Key-value pairs of user properties
 */
export const setUserProperties = async (
  properties: Record<string, string>
): Promise<void> => {
  const analytics = await analyticsPromise;
  if (analytics) {
    firebaseSetUserProperties(analytics, properties);
  }
};

/**
 * Log a custom event to Firebase Analytics
 * @param eventName - The name of the event
 * @param eventParams - Optional parameters for the event
 */
export const logEvent = async (
  eventName: string,
  eventParams?: Record<string, any>
): Promise<void> => {
  const analytics = await analyticsPromise;
  if (analytics) {
    firebaseLogEvent(analytics, eventName, eventParams);
  }
};
