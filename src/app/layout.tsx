import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  JetBrains_Mono,
} from "next/font/google";

import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";

import "./globals.css";

// Body copy, labels and controls.
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

// Headings and big numbers.
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage-grotesque",
});

// Identifiers from the API: usernames, set names, piece IDs.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Builder Catalogue",
    template: "%s · Builder Catalogue",
  },
  description:
    "See which sets a builder can complete with the pieces they already own.",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html
      lang="en"
      className={cn(
        instrumentSans.variable,
        bricolageGrotesque.variable,
        jetbrainsMono.variable,
        "antialiased",
      )}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only rounded-lg bg-brand px-4 py-2.5 font-semibold text-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-10"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;
