import { getAdminSession } from "@/lib/auth";
import { mapNoticeRow } from "@/lib/data/map";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type { NoticeRow } from "@/lib/supabase/types";
import { noticeUpdateSchema } from "@/lib/validators";
import { extractClientIp } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/admin/notices/[id]">
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return Response.json({ error: "invalid_id" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = noticeUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  const input = parsed.data;
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.examLabel !== undefined) updates.exam_label = input.examLabel;
  if (input.releasedOn !== undefined) updates.released_on = input.releasedOn;
  if (input.isPublished !== undefined) updates.is_published = input.isPublished;

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "no_changes" }, { status: 400 });
  }

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
    .update(updates)
    .eq("id", id)
    .select("*")
    .maybeSingle<NoticeRow>();

  if (error) {
    return Response.json(
      { error: "update_failed", message: error.message },
      { status: 500 }
    );
  }
  if (!data) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  const ip = extractClientIp(request.headers);
  logAudit(session.username, "notice.update", ip, `"${data.title}" (${id})`);
  return Response.json({ data: mapNoticeRow(data) });
}

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/notices/[id]">
) {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!isUuid(id)) {
    return Response.json({ error: "invalid_id" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (err) {
    return Response.json(
      { error: "service_unavailable", message: (err as Error).message },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("notices").delete().eq("id", id);
  if (error) {
    return Response.json(
      { error: "delete_failed", message: error.message },
      { status: 500 }
    );
  }
  const ip = extractClientIp(_request.headers);
  logAudit(session.username, "notice.delete", ip, id);
  return Response.json({ ok: true });
}

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
