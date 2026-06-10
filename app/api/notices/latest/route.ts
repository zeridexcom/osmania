import { mapNoticeRow } from "@/lib/data/map";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { NoticeRow } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function GET() {
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
    .limit(5)
    .returns<NoticeRow[]>();

  if (error) {
    return Response.json(
      { error: "query_failed", message: error.message },
      { status: 500 }
    );
  }

  return Response.json({ data: (data ?? []).map(mapNoticeRow) });
}
