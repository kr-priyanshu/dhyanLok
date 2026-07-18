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
  
  if (!googleClientId) {
    return <>{children}</>;
  }

  // key={googleClientId} forces a full remount when the client ID changes,
  // ensuring useGoogleLogin hooks in child components reinitialize correctly.
  return (
    <GoogleOAuthProvider clientId={googleClientId} key={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
