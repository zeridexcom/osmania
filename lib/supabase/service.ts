import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

let serviceClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  if (url.includes("placeholder") || !url.startsWith("https://")) {
    throw new Error("Supabase not configured (placeholder URL detected)");
  }
  if (!serviceClient) {
    serviceClient = createClient<Database>(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return serviceClient;
}
