import { AnalyzeForm } from "./analyze-form";

export const metadata = {
  title: "OtoSonar — Gömülü analiz",
  robots: { index: false, follow: false },
};

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; partner?: string }>;
}) {
  const { theme, partner } = await searchParams;
  const isLight = theme === "light";
  return (
    <div
      style={{
        minHeight: "100dvh",
        background: isLight ? "#ffffff" : "#0a0a0f",
        color: isLight ? "#0a0a0f" : "#e5e7eb",
        padding: 16,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <AnalyzeForm isLight={isLight} partner={partner ?? null} />
    </div>
  );
}
