"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) router.replace(`/auth/callback/route?code=${encodeURIComponent(code)}`);
    else router.replace("/admin/login?error=missing_code");
  }, [router]);
  return <main className="grid min-h-screen place-items-center p-8 text-sm text-muted">Completing secure sign-in…</main>;
}
