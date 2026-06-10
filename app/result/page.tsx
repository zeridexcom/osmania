import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface ResultLookupPageProps {
  searchParams: Promise<{ htno?: string; dob?: string }>;
}

export default async function ResultLookupPage({ searchParams }: ResultLookupPageProps) {
  const params = await searchParams;
  const htno = (params.htno ?? "").trim();
  const dob = (params.dob ?? "").trim();

  if (htno && dob) {
    redirect(`/result/${encodeURIComponent(htno)}?dob=${encodeURIComponent(dob)}`);
  }

  redirect("/");
}
