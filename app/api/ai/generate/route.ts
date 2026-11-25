import { NextResponse } from "next/server";
import { aiGenerationInputSchema } from "@/server/ai/types";
import { requireAdmin } from "@/server/supabase/server";
import { generateValidatedStory } from "@/server/ai/story-service";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = aiGenerationInputSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid generation request.", details: parsed.error.flatten() }, { status: 400 });
    const result = await generateValidatedStory(parsed.data);
    return NextResponse.json({ ok: true, ...result }, { status: result.status === "needs-more-evidence" ? 422 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 422 });
  }
}
