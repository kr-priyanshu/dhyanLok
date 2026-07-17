import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk, Playfair_Display, Fraunces } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import CommandPalette from "../components/CommandPalette";
import ThemeClient from "../components/ThemeClient";
import SettingsPanel from "../components/SettingsPanel";
import NavRail from "../components/NavRail";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import LockScreen from "../components/LockScreen";
import GoogleAuthProviderWrapper from "../components/GoogleAuthProviderWrapper";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", style: ['normal', 'italic'] });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const creamyChicken = localFont({ src: "../fonts/CreamyChicken.otf", variable: "--font-creamy" });

export const metadata: Metadata = {
  title: "DhyanLok",
  description: "Minimalist habit, focus, and meditation realm.",
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
        <GoogleAuthProviderWrapper>
          <LockScreen>
            <CommandPalette />
            <SettingsPanel />
            <NavRail />
            
            <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-8 md:pl-24 transition-all duration-300">
              {children}
            </main>
          </LockScreen>
        </GoogleAuthProviderWrapper>
      </body>
    </html>
  );
}
