import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return Response.json({ username: session.username });
}

export const dynamic = "force-dynamic";
