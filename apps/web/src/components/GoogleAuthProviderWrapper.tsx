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

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
