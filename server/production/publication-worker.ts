import "server-only";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

const supabase = createSupabaseAdminClient();
async function processPublish() {
  const { data: jobs, error } = await supabase.rpc("claim_publication_job");
  if (error) throw error;
  const job = jobs?.[0] as { id: string; video_id: string } | undefined;
  if (!job) return false;
  const { error: publishError } = await supabase.rpc("publish_video", { p_video_id: job.video_id });
  if (publishError) {
    await supabase.from("publication_jobs").update({ status: "failed", last_error: publishError.message }).eq("id", job.id);
  } else {
    await supabase.from("publication_jobs").update({ status: "succeeded", published_at: new Date().toISOString() }).eq("id", job.id);
  }
  return true;
}
async function main() {
  console.info("VIRALSTORY publication worker started.");
  for (;;) {
    try { if (!(await processPublish())) await new Promise((resolve) => setTimeout(resolve, 3000)); }
    catch (error) { console.error("Publication worker error:", error); await new Promise((resolve) => setTimeout(resolve, 5000)); }
  }
}
void main();
