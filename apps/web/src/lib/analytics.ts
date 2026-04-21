import { prisma } from "@/lib/prisma";

export interface EventInput {
  sessionId?: string;
  userId?: string | null;
  event: string;
  path?: string;
  referer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  device?: "mobile" | "desktop" | "tablet";
  metadata?: Record<string, unknown>;
}

/**
 * Fire-and-forget. Never throw — analytics failures must not block traffic.
 */
export async function logEvent(input: EventInput): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        sessionId: input.sessionId ?? "server",
        userId: input.userId ?? null,
        event: input.event.slice(0, 80),
        path: input.path?.slice(0, 300) ?? null,
        referer: input.referer?.slice(0, 300) ?? null,
        utmSource: input.utmSource?.slice(0, 60) ?? null,
        utmMedium: input.utmMedium?.slice(0, 60) ?? null,
        utmCampaign: input.utmCampaign?.slice(0, 80) ?? null,
        country: input.country?.slice(0, 2) ?? null,
        device: input.device ?? null,
        metadata: (input.metadata ?? null) as never,
      },
    });
  } catch {
    // swallow
  }
}

export function parseDevice(ua: string | null): "mobile" | "desktop" | "tablet" {
  if (!ua) return "desktop";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobile|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}
