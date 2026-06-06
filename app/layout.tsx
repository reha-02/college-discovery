// app/layout.tsx
// Root layout wraps all pages with session provider, navbar, footer, and toast.

import type { Metadata } from "next";
import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { ServiceWorkerCleanup } from "@/components/providers/ServiceWorkerCleanup";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "react-hot-toast";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "CollegeFinder India - Discover Your Perfect College",
    template: "%s | CollegeFinder India",
  },
  description:
    "Explore 60+ top colleges across India. Compare fees, placements, ratings, and courses to find your ideal institution.",
  keywords: ["colleges india", "engineering colleges", "college compare", "placement packages"],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="strip-extension-attributes" strategy="beforeInteractive">
          {`
            (function () {
              function stripInjectedAttributes() {
                document.querySelectorAll("[fdprocessedid]").forEach(function (node) {
                  node.removeAttribute("fdprocessedid");
                });
              }

              stripInjectedAttributes();
              new MutationObserver(stripInjectedAttributes).observe(document.documentElement, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ["fdprocessedid"]
              });
            })();
          `}
        </Script>
        <ThemeProvider>
          <SessionProvider session={session}>
            <ServiceWorkerCleanup />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: "8px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                },
                success: { iconTheme: { primary: "#4f52e7", secondary: "#fff" } },
              }}
            />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
