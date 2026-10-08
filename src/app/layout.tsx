import type { Metadata } from "next";
import "./globals.css";
import { VideoModalProvider } from "@/components/video/video-modal-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "SortTube — Your subscriptions, filed by desk",
  description:
    "A curated front page built from your own YouTube subscriptions, sorted into desks like a newspaper instead of shuffled by algorithm.",
};

// Must stay in sync with THEME_STORAGE_KEY in lib/theme/toggle-theme.ts —
// this runs before any JS bundle loads, so it can't import that constant.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('sorttube-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {/* Runs before paint so a saved light/dark choice applies
            immediately — without this, the page would flash the system
            default first, then flip to the saved choice. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <AuthSessionProvider>
          <VideoModalProvider>{children}</VideoModalProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
