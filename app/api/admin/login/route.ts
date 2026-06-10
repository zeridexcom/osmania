import {
  setAdminCookie,
  signAdminToken,
  verifyAdminCredentials,
} from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validators";
import { checkRateLimit, extractClientIp } from "@/lib/ratelimit";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const ip = extractClientIp(request.headers);
  checkRateLimit(ip, "admin.login");
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = adminLoginSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;
  if (!verifyAdminCredentials(username, password)) {
    return Response.json(
      { error: "invalid_credentials" },
      { status: 401 }
    );
  }

  const token = await signAdminToken({ username });
  await setAdminCookie(token);
  logAudit(username, "login", ip);
  return Response.json({ ok: true, username });
}

export const dynamic = "force-dynamic";
