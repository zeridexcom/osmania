export const dynamic = "force-dynamic";

export async function GET() {
  const pkg = await import("@/package.json").then((m) => m.default || m);
  const version = pkg.version ?? "0.1.0";

  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version,
  });
}
