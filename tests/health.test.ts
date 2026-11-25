import { describe, expect, it } from "vitest";
import { getHealthStatus } from "@/lib/health";

describe("getHealthStatus", () => {
  it("returns the web service as healthy", () => {
    expect(getHealthStatus()).toEqual({
      status: "ok",
      service: "VIRALSTORY AI web",
    });
  });
});
