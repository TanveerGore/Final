"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

// This page handles the redirect from OAuth: /auth/callback?token=<JWT>
export default function AuthCallbackPage() {
  const router = useRouter();
  const { fetchUserFromToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // Reload so auth-context picks up the token
      router.replace("/student/dashboard");
    } else {
      router.replace("/login?error=oauth");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground text-sm animate-pulse">Signing you in…</p>
    </div>
  );
}
