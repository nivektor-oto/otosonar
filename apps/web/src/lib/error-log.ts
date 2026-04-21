import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

type Level = "INFO" | "WARNING" | "ERROR" | "FATAL";

interface Context {
  level?: Level;
  path?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

function fingerprint(message: string, stack: string | undefined): string {
  const firstFrame = (stack ?? "").split("\n").find((l) => l.trim().startsWith("at ")) ?? "";
  return createHash("sha1").update(message + "|" + firstFrame.trim()).digest("hex").slice(0, 16);
}

export async function logError(err: unknown, ctx: Context = {}): Promise<void> {
  const message =
    err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err).slice(0, 500);
  const stack = err instanceof Error ? err.stack : undefined;

  try {
    await prisma.errorLog.create({
      data: {
        level: ctx.level ?? "ERROR",
        message: message.slice(0, 2000),
        stack: stack?.slice(0, 8000) ?? null,
        path: ctx.path?.slice(0, 300) ?? null,
        userId: ctx.userId ?? null,
        sessionId: ctx.sessionId ?? null,
        userAgent: ctx.userAgent?.slice(0, 500) ?? null,
        fingerprint: fingerprint(message, stack),
        metadata: (ctx.metadata ?? null) as never,
      },
    });
  } catch {
    console.error("[error-log] DB write failed:", err);
  }
}
