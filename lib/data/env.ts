export function isApiConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  if (url.includes("placeholder")) return false;
  if (!url.startsWith("https://") && !url.startsWith("http://")) return false;
  return true;
}

export function isAdminApiConfigured(): boolean {
  return isApiConfigured() && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
