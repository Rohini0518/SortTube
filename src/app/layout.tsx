import type { Metadata } from "next";
import "./globals.css";
import { VideoModalProvider } from "@/components/video/video-modal-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Sub Desk — Your subscriptions, filed by desk",
  description:
    "A curated front page built from your own YouTube subscriptions, sorted into desks like a newspaper instead of shuffled by algorithm.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthSessionProvider>
          <VideoModalProvider>{children}</VideoModalProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
