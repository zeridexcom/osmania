import { getAdminSession } from "@/lib/auth";
import { mapNoticeRow } from "@/lib/data/map";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { NoticeRow } from "@/lib/supabase/types";
import { noticeInputSchema } from "@/lib/validators";
import { extractClientIp } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const includeUnpublished = url.searchParams.get("includeUnpublished") === "true";

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

  let query = supabase
    .from("notices")
    .select("*")
    .order("released_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (!includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.returns<NoticeRow[]>();
  if (error) {
    return Response.json(
      { error: "query_failed", message: error.message },
      { status: 500 }
    );
  }
  return Response.json({ data: (data ?? []).map(mapNoticeRow) });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = noticeInputSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("notices")
    .insert({
      title: input.title,
      description: input.description,
      exam_label: input.examLabel,
      released_on: input.releasedOn,
      is_published: input.isPublished ?? true,
    })
    .select("*")
    .single<NoticeRow>();

  if (error || !data) {
    return Response.json(
      { error: "insert_failed", message: error?.message ?? "Insert failed" },
      { status: 500 }
    );
  }

  const ip = extractClientIp(request.headers);
  logAudit(session.username, "notice.create", ip, `"${input.title}"`);

  return Response.json({ data: mapNoticeRow(data) }, { status: 201 });
}

export const dynamic = "force-dynamic";
