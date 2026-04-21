// Isolated layout for embed iframes — no Toaster/SW/Analytics/ErrorReporter
// to avoid cross-frame side effects on partner sites.
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
