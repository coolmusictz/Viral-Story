import { allowedWorkflowActions, invalidateApprovalOnVersionChange, transitionWorkflow, type CodebookStatus, type WorkflowReadiness } from "@/lib/workflow/status-machine";

const allReady: WorkflowReadiness = { evidenceComplete: true, factsVerified: true, scenesMatchTarget: true, rightsCleared: true, captionsReady: true, thumbnailReady: true, renderValidated: true, humanWatchedWithSound: true, versionHashCurrent: true };

export const codebookQaChecklist = [
  "safeZones", "truthfulHook", "voicePronunciation", "audioVideoSync", "captionsMatchNarration", "captionsReadable", "noBlackFrames", "noBlackBars", "noAbruptAudioPeaks", "rightsCleared", "factsAndAttributions", "durationAndEnding", "thumbnailTitleLanguageCategoryDescription", "fullWatchWithSound",
] as const;

export type CodebookQaCheck = (typeof codebookQaChecklist)[number];

export function validateQaChecklist(checks: Partial<Record<CodebookQaCheck, boolean>>) {
  return codebookQaChecklist.filter((check) => checks[check] !== true);
}

export function normalizeLegacyStatus(value: string): CodebookStatus | null {
  const aliases: Record<string, CodebookStatus> = {
    "fact-check": "needs_verification",
    "ready-for-production": "script_approved",
    "needs-review": "needs_review",
    "needs_verification": "needs_verification",
    "script_approved": "script_approved",
    "needs_review": "needs_review",
  };
  if (value in aliases) return aliases[value]!;
  return ["discovered", "shortlisted", "researching", "draft", "producing", "approved", "scheduled", "published", "rejected", "failed", "archived"].includes(value) ? value as CodebookStatus : null;
}

export function canMove(actor: keyof typeof allowedWorkflowActions[CodebookStatus], status: CodebookStatus, action: Parameters<typeof transitionWorkflow>[0]["action"], readiness?: Partial<WorkflowReadiness>) {
  return transitionWorkflow({ actor, status, action, readiness });
}

export function newVersionInvalidatesReview(input: { status: CodebookStatus; versionHash: string | null; approvedVersionHash: string | null }, nextHash: string) {
  return invalidateApprovalOnVersionChange(input, nextHash);
}

export { allReady };
