import { clearAdminCookie, getAdminSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  logAudit(session.username, "logout", "0.0.0.0");
  await clearAdminCookie();
  return Response.json({ ok: true });
}

export const dynamic = "force-dynamic";
