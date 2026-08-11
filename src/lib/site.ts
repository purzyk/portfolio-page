/**
 * localhost is only the development default — shipping with it would make canonical
 * URLs, the sitemap, robots.txt and structured data all point at the wrong host.
 * Set NEXT_PUBLIC_SITE_URL at deploy time.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
