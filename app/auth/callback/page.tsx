"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return <main className="grid min-h-screen place-items-center p-8 text-sm text-muted">Completing secure sign-in…</main>;
}
