import { NextResponse, type NextRequest } from "next/server";
import { isFeatureEnabled } from "@/lib/feature-flags";

const AB_VARIANTS = ["dealer", "buyer"] as const;
type AbVariant = (typeof AB_VARIANTS)[number];
const AB_COOKIE = "ab_variant";
const AB_HEADER = "x-ab-variant";
const AB_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function pickVariant(): AbVariant {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  return (bytes[0] & 1) === 0 ? "dealer" : "buyer";
}

function normalizeVariant(raw: string | undefined): AbVariant | null {
  if (raw === "dealer" || raw === "buyer") return raw;
  return null;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !isFeatureEnabled("ADMIN_PANEL_ENABLED")) {
    return new NextResponse(null, { status: 404 });
  }

  const abEnabled = isFeatureEnabled("AB_LANDING_VARIANT_B_ENABLED");
  const existing = normalizeVariant(req.cookies.get(AB_COOKIE)?.value);
  let variant: AbVariant | null = existing;
  let assignedNow = false;

  if (abEnabled && !existing) {
    variant = pickVariant();
    assignedNow = true;
  }

  const reqHeaders = new Headers(req.headers);
  if (abEnabled && variant) {
    reqHeaders.set(AB_HEADER, variant);
  } else {
    reqHeaders.delete(AB_HEADER);
  }

  const res = NextResponse.next({ request: { headers: reqHeaders } });

  if (assignedNow && variant) {
    res.cookies.set(AB_COOKIE, variant, {
      maxAge: AB_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
    });
    // TODO: PostHog track("ab_assigned", { variant })
    console.info(`[ab] assigned variant=${variant}`);
  }

  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
