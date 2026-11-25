import { describe, expect, it } from "vitest";
import { analyticsEventSchema } from "@/lib/analytics/analytics-policy";

describe("analytics event schema privacy boundary", () => {
  it("accepts bounded anonymous aggregate event shape", () => {
    expect(analyticsEventSchema.safeParse({ eventId: "00000000-0000-4000-8000-000000000001", videoId: "00000000-0000-4000-8000-000000000002", kind: "watch", watchMs: 12000, language: "sw", categoryId: null, trafficSource: "social" }).success).toBe(true);
  });
  it("rejects personal fields and out-of-range durations", () => {
    expect(analyticsEventSchema.safeParse({ eventId: "00000000-0000-4000-8000-000000000001", videoId: "00000000-0000-4000-8000-000000000002", kind: "watch", watchMs: 99999999, language: "sw", ip: "203.0.113.1" }).success).toBe(false);
  });
});
