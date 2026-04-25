import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AIAssistant } from "@/components/ai-assistant";

export default function AppShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <AIAssistant />
    </div>
  );
}
