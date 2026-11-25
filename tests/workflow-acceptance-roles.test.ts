import { describe, expect, it } from "vitest";
import { allReady, canMove } from "@/lib/workflow/codebook";

describe("workflow acceptance roles", () => {
  it("denies editors owner-only publish actions", () => {
    expect(canMove("editor", "approved", "publish", allReady).ok).toBe(false);
  });
  it("blocks publishing rejected and draft content", () => {
    expect(canMove("admin", "rejected", "publish", allReady).ok).toBe(false);
    expect(canMove("admin", "draft", "publish", allReady).ok).toBe(false);
  });
  it("requires rights, render and current-version gates", () => {
    expect(canMove("admin", "approved", "publish", { ...allReady, rightsCleared: false }).ok).toBe(false);
    expect(canMove("admin", "approved", "publish", { ...allReady, renderValidated: false }).ok).toBe(false);
    expect(canMove("admin", "approved", "publish", { ...allReady, versionHashCurrent: false }).ok).toBe(false);
  });
});
