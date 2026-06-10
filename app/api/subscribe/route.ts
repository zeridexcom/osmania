import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

const subscribers: string[] = [];

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = subscribeSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  subscribers.push(email);
  console.log(`[Subscribe] New subscriber: ${email} (total: ${subscribers.length})`);

  return Response.json({ ok: true, message: "Successfully subscribed." });
}
