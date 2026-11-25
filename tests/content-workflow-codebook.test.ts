import { describe, expect, it } from "vitest";
import { allReady, canMove, codebookQaChecklist, newVersionInvalidatesReview, normalizeLegacyStatus, validateQaChecklist } from "@/lib/workflow/codebook";

describe("content workflow codebook gates", () => {
  it("normalizes older status names without losing canonical transitions", () => {
    expect(normalizeLegacyStatus("fact-check")).toBe("needs_verification");
    expect(normalizeLegacyStatus("ready-for-production")).toBe("script_approved");
    expect(normalizeLegacyStatus("needs-review")).toBe("needs_review");
  });

  it("enforces role/status transitions and script readiness", () => {
    expect(canMove("editor", "discovered", "shortlist").ok).toBe(true);
    expect(canMove("editor", "discovered", "publish").ok).toBe(false);
    expect(canMove("editor", "draft", "approve-script").ok).toBe(false);
    expect(canMove("editor", "draft", "approve-script", allReady).ok).toBe(true);
  });

  it("requires full-watch QA and current hash before approval or publishing", () => {
    expect(canMove("reviewer", "needs_review", "approve-video", { ...allReady, humanWatchedWithSound: false }).ok).toBe(false);
    expect(canMove("admin", "approved", "publish", { ...allReady, versionHashCurrent: false }).ok).toBe(false);
    expect(canMove("admin", "approved", "publish", allReady).ok).toBe(true);
  });

  it("invalidates an old approval when any version hash changes", () => {
    const updated = newVersionInvalidatesReview({ status: "approved", versionHash: "old", approvedVersionHash: "old" }, "new");
    expect(updated.status).toBe("needs_review");
    expect(updated.approvedVersionHash).toBeNull();
  });

  it("requires every detailed QA checklist item", () => {
    expect(validateQaChecklist({})).toHaveLength(codebookQaChecklist.length);
    expect(validateQaChecklist(Object.fromEntries(codebookQaChecklist.map((key) => [key, true])))).toEqual([]);
  });
});
