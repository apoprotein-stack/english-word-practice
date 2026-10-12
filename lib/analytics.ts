import { inject } from "@vercel/analytics";

/**
 * Vercel Web Analytics: anonymous page views only (no cookies, no learning records).
 * The script is served by Vercel at /_vercel/insights; on other hosts it simply fails to load.
 */
export function registerAnalytics() {
  if (typeof window === "undefined") return;
  inject({ mode: process.env.NODE_ENV === "production" ? "production" : "development" });
}
