"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

// Routes that are accessible without being logged in.
const PUBLIC_ROUTES = ["/"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    // Only act once the store has fully loaded from localStorage.
    // Before that, hasHydrated is false and we sit still — no premature redirect.
    if (!hasHydrated) return;

    if (!isLoggedIn && !isPublicRoute) {
      router.push("/");
    }
  }, [hasHydrated, isLoggedIn, isPublicRoute, router]);

  // Phase 1 — store hasn't loaded yet.
  // Show a blank screen matching the background instead of null/redirect,
  // which would cause a jarring flash or premature bounce.
  if (!hasHydrated) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ background: "var(--theme-bg)" }}
      />
    );
  }

  // Phase 2 — store is loaded, user is not logged in on a protected route.
  // Show blank while the useEffect redirect fires.
  if (!isLoggedIn && !isPublicRoute) {
    return (
      <div
        className="min-h-screen w-full"
        style={{ background: "var(--theme-bg)" }}
      />
    );
  }

  return <>{children}</>;
}
