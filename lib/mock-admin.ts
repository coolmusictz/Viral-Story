import type { AdminStory, MediaAsset, ProductionJob, ResearchClaim, StudioUser, Trend } from "@/types/admin";

export const mockAdminStories: AdminStory[] = [
  { id: "ST-104", title: { en: "The last matatu to Kariakoo", sw: "Matatu ya mwisho kwenda Kariakoo" }, category: "Mystery", language: "both", status: "needs-review", owner: "Amina J.", updated: "8 min ago", claims: 4, verifiedClaims: 4 },
  { id: "ST-103", title: { en: "A voice note from tomorrow", sw: "Ujumbe wa sauti wa kesho" }, category: "What if", language: "en", status: "producing", owner: "Neema K.", updated: "24 min ago", claims: 0, verifiedClaims: 0 },
  { id: "ST-102", title: { en: "Mwezi juu ya bahari", sw: "Mwezi juu ya bahari" }, category: "Love & life", language: "sw", status: "fact-check", owner: "Amina J.", updated: "1 hr ago", claims: 3, verifiedClaims: 2 },
  { id: "ST-101", title: { en: "The blue door on Uhuru Street", sw: "Mlango wa bluu Mtaa wa Uhuru" }, category: "Mystery", language: "both", status: "ready-for-production", owner: "Juma M.", updated: "Yesterday", claims: 2, verifiedClaims: 2 },
  { id: "ST-100", title: { en: "Two cups of chai", sw: "Vikombe viwili vya chai" }, category: "Love & life", language: "sw", status: "published", owner: "Neema K.", updated: "2 days ago", claims: 0, verifiedClaims: 0 },
  { id: "ST-099", title: { en: "The rain remembers", sw: "Mvua hukumbuka" }, category: "Mystery", language: "en", status: "archived", owner: "Juma M.", updated: "Nov 18", claims: 1, verifiedClaims: 0 },
];

export const mockTrends: Trend[] = [
  { id: "TR-28", phrase: "Dar after dark", platform: "Community signals", score: 94, status: "shortlisted", region: "Dar es Salaam" },
  { id: "TR-27", phrase: "Letters never sent", platform: "Editorial watchlist", score: 89, status: "researching", region: "East Africa" },
  { id: "TR-26", phrase: "The last bus home", platform: "Mock trend feed", score: 82, status: "discovered", region: "Tanzania" },
  { id: "TR-25", phrase: "A story in two languages", platform: "Community signals", score: 74, status: "draft", region: "East Africa" },
];

export const mockClaims: ResearchClaim[] = [
  { id: "CL-01", claim: "Kariakoo market is one of Dar es Salaam's major trading districts.", source: "https://en.wikipedia.org/wiki/Kariakoo", state: "verified" },
  { id: "CL-02", claim: "The market's name is linked to the British Carrier Corps.", source: "https://www.britannica.com/place/Dar-es-Salaam", state: "needs-check" },
  { id: "CL-03", claim: "Matatu routes run through the exact fictional street in the script.", source: "No primary source recorded", state: "disputed" },
];

export const mockJobs: ProductionJob[] = [
  { id: "JOB-220", story: "A voice note from tomorrow", stage: "Rendering captions", progress: 68, status: "producing", updated: "2 min ago" },
  { id: "JOB-219", story: "The last matatu to Kariakoo", stage: "Human review", progress: 100, status: "needs-review", updated: "8 min ago" },
  { id: "JOB-218", story: "Mwezi juu ya bahari", stage: "Voiceover generation", progress: 28, status: "failed", updated: "42 min ago" },
];

export const mockAssets: MediaAsset[] = [
  { id: "AS-77", name: "kariakoo-poster-v1", kind: "Poster", rights: "Original mock artwork", state: "Ready" },
  { id: "AS-76", name: "street-ambience-tz", kind: "Audio", rights: "Rights not attached", state: "Needs rights" },
  { id: "AS-75", name: "matatu-caption-sw", kind: "Caption", rights: "Original text", state: "Ready" },
  { id: "AS-74", name: "render-preview-103", kind: "Video", rights: "Internal preview", state: "Review only" },
];

export const mockUsers: StudioUser[] = [
  { id: "U-01", name: "Amina Juma", email: "amina@example.test", role: "admin", state: "Active" },
  { id: "U-02", name: "Neema Kweka", email: "neema@example.test", role: "editor", state: "Active" },
  { id: "U-03", name: "Juma Mushi", email: "juma@example.test", role: "reviewer", state: "Active" },
  { id: "U-04", name: "Guest Reviewer", email: "guest@example.test", role: "viewer", state: "Invited" },
];
