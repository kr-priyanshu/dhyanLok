import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Playfair_Display, Fraunces } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import CommandPalette from "../components/CommandPalette";
import ThemeClient from "../components/ThemeClient";
import SettingsPanel from "../components/SettingsPanel";
import NavRail from "../components/NavRail";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import AuthGuard from "../components/AuthGuard";
import GoogleAuthProviderWrapper from "../components/GoogleAuthProviderWrapper";
import UltraFocusClock from "../components/UltraFocusClock";
import CloudSyncProvider from "../components/CloudSyncProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", preload: false });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", preload: false });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", style: ['normal', 'italic'], preload: false });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", preload: false });
const creamyChicken = localFont({ src: "../fonts/CreamyChicken.otf", variable: "--font-creamy" });

export const metadata: Metadata = {
  title: "DhyanLok",
  description: "Minimalist habit, focus, and meditation realm.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable} ${space.variable} ${playfair.variable} ${fraunces.variable} ${creamyChicken.variable} dark`}>
      <body className="antialiased min-h-screen flex flex-col overflow-x-hidden font-sans transition-colors duration-500 bg-[var(--theme-bg)] text-[var(--theme-text)] selection:bg-[var(--theme-text)] selection:text-[var(--theme-bg)]">
        <ThemeClient />
        <ServiceWorkerRegister />
        <UltraFocusClock />
        <GoogleAuthProviderWrapper>
          <AuthGuard>
            <CommandPalette />
            <SettingsPanel />
            <NavRail />
            <CloudSyncProvider />
            
            <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-24 md:pb-8 md:pl-24 transition-all duration-300 overflow-x-hidden">
              {children}
            </main>
          </AuthGuard>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
