import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/server/supabase/server";
import { generateValidatedStory } from "@/server/ai/story-service";

const generateSchema = z.object({ trendTitle: z.string().min(3), researchNotes: z.string(), verifiedClaims: z.array(z.string()), targetAudience: z.string(), category: z.string(), tone: z.string(), targetDuration: z.number().int().min(15).max(120), approvedTrend: z.literal(true) });

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const input = generateSchema.parse(await request.json());
    const output = await generateValidatedStory(input);
    return NextResponse.json({ ok: true, status: "needs-human-review", output });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 422 });
  }
}
