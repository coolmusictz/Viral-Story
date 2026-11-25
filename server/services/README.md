# Server services

Put server-only integrations and application services in this directory (for example, database access and future AI adapters). Read credentials from server environment variables only; never import these modules into Client Components or expose secret values in `NEXT_PUBLIC_*` variables. Keep provider implementations replaceable and test them independently.

No external service integrations are configured in this scaffold.
