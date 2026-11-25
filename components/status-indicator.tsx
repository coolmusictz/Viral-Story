import type { HealthStatus } from "@/types/health";

export function StatusIndicator({ status }: { status: HealthStatus["status"] }) {
  const isHealthy = status === "ok";

  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 rounded-full ${isHealthy ? "bg-emerald-400" : "bg-red-400"}`}
      />
      <span className="font-semibold text-paper">
        {isHealthy ? "Operational" : "Unavailable"}
      </span>
      <span className="text-sm text-muted">({status})</span>
    </div>
  );
}
