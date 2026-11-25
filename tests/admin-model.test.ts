import { describe, expect, it } from "vitest";
import { workflowStatuses } from "@/types/admin";
import { mockAdminStories } from "@/lib/mock-admin";

describe("admin workflow mock model", () => {
  it("includes the documented production and publishing lifecycle states", () => {
    expect(workflowStatuses).toEqual(["discovered", "shortlisted", "researching", "draft", "fact-check", "ready-for-production", "producing", "needs-review", "approved", "scheduled", "published", "rejected", "failed", "archived"]);
  });

  it("marks mock public eligibility only for explicitly published stories", () => {
    const publicCandidates = mockAdminStories.filter((story) => story.status === "published");
    expect(publicCandidates.map((story) => story.id)).toEqual(["ST-100"]);
    expect(mockAdminStories.some((story) => story.status === "needs-review" && story.status === "published")).toBe(false);
  });
});
