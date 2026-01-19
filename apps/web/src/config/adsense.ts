/**
 * AdSense configuration
 * Central place to manage AdSense client ID and ad slot IDs
 */

export const ADSENSE_CONFIG = {
  clientId: 'ca-pub-7645850220804105',
  slots: {
    homepageLeftSidebar: '1234567890',
    homepageRightSidebar: '0987654321',
    homepageBottom: '1111111111',
    resourcePacksTop: '2222222222',
    resourcePacksBottom: '2222222223',
    addonsTop: '3333333332',
    addonsBottom: '3333333333',
    craftingTweaksTop: '3333333334',
    craftingTweaksBottom: '3333333335',
  },
} as const;
