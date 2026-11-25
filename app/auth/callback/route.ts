import { createBrowserClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) return Response.redirect(new URL("/admin/login?error=missing_code", url.origin));

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return Response.redirect(new URL("/admin/login?error=auth_failed", url.origin));
  return Response.redirect(new URL("/admin", url.origin));
}
