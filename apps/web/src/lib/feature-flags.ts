/**
 * Feature flag registry — server-only, fail-closed.
 *
 * Adding a flag:
 *   1. Add the flag name + default (always `false` for in-flight features) below.
 *   2. Document it in `apps/web/.env.example`.
 *   3. Gate the route/UI with `isFeatureEnabled("FLAG_NAME")` and return
 *      `featureDisabledResponse("FLAG_NAME")` from API handlers when off.
 *
 * Why server-only: every call reads `process.env`, which Next.js inlines at build
 * time only for `NEXT_PUBLIC_*` vars. Server-side reads always reflect the current
 * deploy's environment — no rebuild needed to flip a flag in Vercel.
 */

import { NextResponse } from "next/server";

export const FEATURE_FLAG_DEFAULTS = {
  MARKETPLACE_PAYWALL_ENABLED: false,
  MESSAGING_ENABLED: false,
  WHATSAPP_WEBHOOK_ENABLED: false,
  CRM_API_ENABLED: false,
  DEALER_ADVANCED_FEATURES: false,
  AI_DIAGNOSIS_ENABLED: false,
  AB_LANDING_VARIANT_B_ENABLED: false,
} as const satisfies Record<string, boolean>;

export type FeatureFlag = keyof typeof FEATURE_FLAG_DEFAULTS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const raw = process.env[flag];
  if (raw === undefined || raw === "") return FEATURE_FLAG_DEFAULTS[flag];
  return raw.toLowerCase() === "true" || raw === "1";
}

export function featureDisabledResponse(flag: FeatureFlag) {
  return NextResponse.json(
    { success: false, error: "feature_disabled", feature: flag },
    { status: 503 }
  );
}
