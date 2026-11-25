# Supabase server setup

- `server/supabase/server.ts`: creates a cookie-aware browser-session Supabase client for server routes.
- `server/supabase/admin.ts`: creates a service-role client for approved server-only operations only. Never import in browser or client components.
- Public reads use anonymous or authenticated public RLS policies, never the service role.
- Auth invites use `/api/admin/invite` and require an active owner/admin profile. The service-role key issues the invitation and creates no public admin privileges without profile activation.
