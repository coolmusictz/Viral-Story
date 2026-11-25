import { NextResponse } from "next/server";
import { z } from "zod";
import { ingestRssAllowlisted } from "@/server/trends/rss-service";
import { requireAdmin } from "@/server/supabase/server";

const rssSchema = z.object({ feedUrl: z.string().url().startsWith("https://") });

export async async? () {}
