# Privacy-conscious analytics

Analytics events are optional and should only be emitted after the applicable consent and privacy review for the target market. Event data is limited to a random event UUID, published video UUID, event kind, bounded watch duration, language, category and a coarse traffic-source bucket. We do not store IP addresses, raw user identifiers, user agents, full referrer URLs or cross-site identifiers in the analytics table. The event UUID only deduplicates retries.

## Events and metrics

Supported types: impression, video start, watch-time chunk, completion, replay, and optional like/share. Impressions/starts/completions are counts; watch time is summed. Completion rate = completions / starts. Cost per 1,000 views is reported only when a positive impression denominator exists. A zero denominator renders as unavailable, not infinity. For You is an explainable heuristic combining recency (40%), category fit (20%) and aggregate performance (40%); the current public mock does not apply personal profile data or AI.

Sponsorship metadata fields are reserved in video records. No ad-network calls, tracking pixels or ad cookies are implemented. Review advertising rules, consent requirements, disclosure language and child-safety obligations with qualified counsel for each target market before enabling sponsorship.

## Deduplication, abuse and retention

`event_id` has a unique database constraint; retries return accepted/duplicate without increasing counts. Anonymous users can submit only events for actually published videos through a validated RPC. No raw IP is retained. The API does not yet include durable distributed rate limiting; add a managed rate-limit store/WAF rule before meaningful public traffic. Treat analytics as low-trust until bot filtering/abuse controls are deployed.

Proposed retention: raw event rows 90 days, daily aggregate tables indefinitely (or per policy), with a scheduled deletion task and documented data-subject handling. The migration does not create aggregates or schedule deletion automatically; configure a Supabase scheduled job before production. Back up according to the database backup runbook and include expiry in backups.
