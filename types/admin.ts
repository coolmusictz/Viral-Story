export const workflowStatuses = [
  "discovered",
  "shortlisted",
  "researching",
  "draft",
  "fact-check",
  "ready-for-production",
  "producing",
  "needs-review",
  "approved",
  "scheduled",
  "published",
  "rejected",
  "failed",
  "archived",
] as const;

export type WorkflowStatus = (typeof workflowStatuses)[number];
export type AdminRole = "admin" | "editor" | "reviewer" | "viewer";
export type AdminScreen =
  | "dashboard"
  | "trends"
  | "trend-detail"
  | "research"
  | "editor"
  | "storyboard"
  | "assets"
  | "jobs"
  | "review"
  | "library"
  | "publish"
  | "analytics"
  | "settings"
  | "users"
  | "archive";

export type AdminStory = {
  id: string;
  title: { en: string; sw: string };
  category: string;
  language: "en" | "sw" | "both";
  status: WorkflowStatus;
  owner: string;
  updated: string;
  claims: number;
  verifiedClaims: number;
};

export type Trend = { id: string; phrase: string; platform: string; score: number; status: WorkflowStatus; region: string };
export type ResearchClaim = { id: string; claim: string; source: string; state: "verified" | "needs-check" | "disputed" };
export type ProductionJob = { id: string; story: string; stage: string; progress: number; status: WorkflowStatus; updated: string };
export type MediaAsset = { id: string; name: string; kind: "Poster" | "Audio" | "Video" | "Caption"; rights: string; state: string };
export type StudioUser = { id: string; name: string; email: string; role: AdminRole; state: "Active" | "Invited" };
