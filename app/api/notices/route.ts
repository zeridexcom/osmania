import { mapNoticeRow } from "@/lib/data/map";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { NoticeRow } from "@/lib/supabase/types";
import { checkRateLimit, extractClientIp } from "@/lib/ratelimit";

export async function GET(request: Request) {
  const ip = extractClientIp(request.headers);
  checkRateLimit(ip, "notices.list");
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 20;
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 100)
    : 20;

  let supabase;
  try {
    supabase = await getSupabaseServerClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("is_published", true)
    .order("released_on", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<NoticeRow[]>();

  if (error) {
    return Response.json(
      { error: "query_failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({ data: (data ?? []).map(mapNoticeRow) });
}

export const dynamic = "force-dynamic";
