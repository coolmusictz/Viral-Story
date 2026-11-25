# Environment configuration

Use a local `.env.local` and configure the same values in Vercel.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://bkeawnuareawlcsasbgj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-secret>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
AI_PROVIDER=mock
TREND_ALLOWLIST=
TREND_FETCH_TIMEOUT_MS=8000
TREND_RPM_LIMIT=20
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in browser code or in `.env.example` with a real value. Rotate the publishable key if it was shared in a public issue or channel.
