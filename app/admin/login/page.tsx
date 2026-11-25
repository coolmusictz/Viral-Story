"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );

  async function signIn(event: React.FormEvent) {
    event.preventEventDefault();
    setStatus("Sending invitation sign-in link…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? error.message : "Check your email for the secure sign-in link.");
  }

  return <main className="mx-auto grid min-h-screen max-w-md place-items-center px-5"><form onSubmit={signIn} className="w-full rounded-lg border border-white/10 bg-surface p-6"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">VIRALSTORY AI</p><h1 className="mt-3 text-2xl font-semibold">Admin sign in</h1><p className="mt-2 text-sm leading-6 text-muted">Only invited studio accounts can access protected routes.</p><label htmlFor="admin-email" className="mt-6 block text-sm font-medium">Email</label><input id="admin-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 min-h-11 w-full rounded-md border border-white/10 bg-background px-3 text-sm"/><button type="submit" className="mt-4 min-h-11 w-full rounded-md bg-ember text-sm font-semibold text-background">Email sign-in link</button>{status && <p role="status" className="mt-4 text-sm text-muted">{status}</p>}</form></main>;
}
