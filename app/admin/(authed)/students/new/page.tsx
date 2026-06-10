"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { AddEditStudentForm } from "@/components/AddEditStudentForm";

export default function NewStudentPage() {
  const router = useRouter();

  const onDone = useCallback(() => {
    router.push("/admin/students");
  }, [router]);

  const onSaveAndAddAnother = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <AddEditStudentForm
          mode="create"
          onDone={onDone}
          onSaveAndAddAnother={onSaveAndAddAnother}
        />
      </div>
    </div>
  );
}
