"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";

export default function GoogleAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  const { googleClientId } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;
  
  const activeClientId = googleClientId || "425063335581-2ubb3pr3lt6194r34nmbomcil3bio1h2.apps.googleusercontent.com";

  if (!activeClientId) {
    return <>{children}</>;
  }

  return (
    <GoogleOAuthProvider clientId={activeClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
