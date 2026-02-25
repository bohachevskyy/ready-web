import Hotjar from '@hotjar/browser';

/**
 * Initialize Hotjar tracking.
 * Requires REACT_APP_HOTJAR_SITE_ID environment variable.
 */
export function initializeHotjar(): void {
  const siteId = process.env.REACT_APP_HOTJAR_SITE_ID;

  if (!siteId) {
    console.warn('Hotjar site ID not configured. Skipping initialization.');
    return;
  }

  const hotjarVersion = 6;

  Hotjar.init(Number(siteId), hotjarVersion);
}

/**
 * Identify the current user in Hotjar by email.
 * Call with null to clear identification on logout.
 */
export function identifyHotjarUser(
  userId: string | null,
  email: string | null
): void {
  if (!userId || !email) {
    return;
  }

  Hotjar.identify(userId, { email });
}
