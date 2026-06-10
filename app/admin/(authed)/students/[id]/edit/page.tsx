"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AddEditStudentForm } from "@/components/AddEditStudentForm";
import { clientGetAdminStudent } from "@/lib/data/client";
import { mockGetStudentById } from "@/lib/data/mock-state";
import type { Student } from "@/lib/types";

interface EditStudentPageProps {
  params: Promise<{ id: string }>;
}

export default function EditStudentPage({ params }: EditStudentPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const [student, setStudent] = useState<Student | null>(() => mockGetStudentById(id));
  const [loading, setLoading] = useState(student === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    clientGetAdminStudent(id)
      .then((s) => {
        if (cancelled) return;
        setStudent(s);
        setLoading(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const onDone = useCallback(() => {
    router.push("/admin/students");
  }, [router]);

  if (loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center text-center p-12">
        <p className="font-body text-sm text-on-surface-variant">Loading student&hellip;</p>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-2">Student Not Found</h1>
        <p className="font-body text-sm text-on-surface-variant mb-4">
          {error
            ? `Failed to load: ${error}`
            : "No record matches that Hall Ticket in mock state."}
        </p>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label text-xs uppercase tracking-widest"
        >
          <ArrowLeft className="size-4" />
          Back to Students
        </Link>
      </main>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <AddEditStudentForm mode="edit" initial={student} onDone={onDone} />
      </div>
    </div>
  );
}
