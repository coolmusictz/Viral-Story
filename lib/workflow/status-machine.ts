export const codebookStatuses = [
  "discovered",
  "shortlisted",
  "researching",
  "needs_verification",
  "draft",
  "script_approved",
  "producing",
  "needs_review",
  "approved",
  "scheduled",
  "published",
  "rejected",
  "failed",
  "archived",
] as const;

export type CodebookStatus = (typeof codebookStatuses)[number];
export type WorkflowActor = "system" | "editor" | "producer" | "reviewer" | "admin";
export type WorkflowAction = "shortlist" | "research" | "verify" | "draft" | "approve-script" | "produce" | "submit-review" | "approve-video" | "reject" | "schedule" | "publish" | "retry" | "archive" | "restore";

export const allowedWorkflowActions: Record<CodebookStatus, Partial<Record<WorkflowActor, WorkflowAction[]>>> = {
  discovered: { system: ["shortlist"], editor: ["shortlist", "archive"] },
  shortlisted: { editor: ["research", "archive"] },
  researching: { editor: ["verify", "draft", "archive"] },
  needs_verification: { editor: ["research", "verify", "archive"] },
  draft: { editor: ["draft", "approve-script", "archive"] },
  script_approved: { editor: ["approve-script"], producer: ["produce"], admin: ["produce", "archive"] },
  producing: { system: ["submit-review", "retry"], producer: ["submit-review", "retry", "archive"] },
  needs_review: { reviewer: ["approve-video", "reject"], admin: ["approve-video", "reject"] },
  approved: { admin: ["schedule", "publish", "archive"] },
  scheduled: { admin: ["publish", "archive"] },
  published: { admin: ["archive"] },
  rejected: { editor: ["draft", "archive"], admin: ["draft", "archive"] },
  failed: { system: ["retry"], producer: ["retry", "archive"], admin: ["retry", "archive"] },
  archived: { admin: ["restore"] },
};

const nextStatus: Record<WorkflowAction, CodebookStatus> = {
  shortlist: "shortlisted",
  research: "researching",
  verify: "draft",
  draft: "draft",
  "approve-script": "script_approved",
  produce: "producing",
  "submit-review": "needs_review",
  "approve-video": "approved",
  reject: "rejected",
  schedule: "scheduled",
  publish: "published",
  retry: "producing",
  archive: "archived",
  restore: "draft",
};

export type WorkflowReadiness = {
  evidenceComplete: boolean;
  factsVerified: boolean;
  scenesMatchTarget: boolean;
  rightsCleared: boolean;
  captionsReady: boolean;
  thumbnailReady: boolean;
  renderValidated: boolean;
  humanWatchedWithSound: boolean;
  versionHashCurrent: boolean;
};

export function transitionWorkflow(input: {
  status: CodebookStatus;
  action: WorkflowAction;
  actor: WorkflowActor;
  readiness?: Partial<WorkflowReadiness>;
}): { ok: true; status: CodebookStatus } | { ok: false; reason: string } {
  const { status, action, actor, readiness = {} } = input;
  if (!allowedWorkflowActions[status][actor]?.includes(action)) {
    return { ok: false, reason: `${actor} cannot ${action} while a story is ${status}.` };
  }
  if (action === "approve-script") {
    const required: (keyof WorkflowReadiness)[] = ["evidenceComplete", "factsVerified", "scenesMatchTarget"];
    if (required.some((key) => readiness[key] !== true)) return { ok: false, reason: "Script approval requires complete evidence, verified material facts, and validated target duration." };
  }
  if (action === "produce" || action === "submit-review" || action === "approve-video" || action === "schedule" || action === "publish") {
    const required: (keyof WorkflowReadiness)[] = ["evidenceComplete", "factsVerified", "scenesMatchTarget", "rightsCleared", "captionsReady", "thumbnailReady", "renderValidated"];
    if (required.some((key) => readiness[key] !== true)) return { ok: false, reason: "Production/review/publishing readiness checks are incomplete." };
  }
  if (action === "approve-video" && readiness.humanWatchedWithSound !== true) {
    return { ok: false, reason: "Reviewer must watch the full render with sound and complete QA." };
  }
  if ((action === "schedule" || action === "publish") && readiness.versionHashCurrent !== true) {
    return { ok: false, reason: "Approval is stale: script or assets changed after the reviewed version." };
  }
  return { ok: true, status: nextStatus[action] };
}

export function invalidateApprovalOnVersionChange<T extends { status: CodebookStatus; versionHash: string | null; approvedVersionHash: string | null }>(record: T, nextVersionHash: string): T {
  if (record.approvedVersionHash && record.approvedVersionHash !== nextVersionHash) {
    return { ...record, status: "needs_review", versionHash: nextVersionHash, approvedVersionHash: null };
  }
  return { ...record, versionHash: nextVersionHash };
}
