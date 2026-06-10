"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Megaphone, CalendarDays, Eye, EyeOff } from "lucide-react";
import type { Notice } from "@/lib/types";
import {
  clientCreateAdminNotice,
  clientDeleteAdminNotice,
  clientGetAdminNotices,
  clientUpdateAdminNotice,
} from "@/lib/data/client";
import { EmptyState } from "@/components/EmptyState";
import { cn } from "@/lib/utils";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type NoticeDraft = Omit<Notice, "id" | "createdAt">;

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    clientGetAdminNotices(true)
      .then((items) => {
        if (cancelled) return;
        setNotices(items);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function togglePublished(id: string) {
    const notice = notices.find((n) => n.id === id);
    if (!notice) return;
    const next = { ...notice, isPublished: !notice.isPublished };
    setNotices((list) => list.map((n) => (n.id === id ? next : n)));
    clientUpdateAdminNotice(id, { isPublished: next.isPublished }).catch((err: Error) =>
      setError(err.message)
    );
  }

  function remove(id: string) {
    setNotices((list) => list.filter((n) => n.id !== id));
    clientDeleteAdminNotice(id).catch((err: Error) => setError(err.message));
  }

  return (
    <main className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <p className="font-label text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">Communications</p>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface">Notices</h1>
            <p className="font-body text-sm text-on-surface-variant mt-1">Publish circulars, exam alerts and result announcements.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label text-xs uppercase tracking-widest font-bold shadow-sm hover:bg-primary-container hover:text-white transition-colors"
          >
            <Plus className="size-4" />
            New Notice
          </button>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-error-container/30 text-on-error-container border border-error/30 font-body text-sm mb-6">
            {error}
          </div>
        )}

        {showForm && (
          <div className="mb-6">
            <NoticeForm
              notice={editingId ? notices.find((n) => n.id === editingId) ?? null : null}
              onClose={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              onSave={async (data) => {
                try {
                  if (editingId) {
                    const updated = await clientUpdateAdminNotice(editingId, data);
                    setNotices((list) =>
                      list.map((n) => (n.id === editingId ? updated : n))
                    );
                  } else {
                    const created = await clientCreateAdminNotice(data);
                    setNotices((list) => [created, ...list]);
                  }
                  setShowForm(false);
                  setEditingId(null);
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            />
          </div>
        )}

        {notices.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No notices yet"
            description="Create your first notice to publish on the public portal."
            actionLabel="New Notice"
            actionHref="#"
          />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {notices.map((n) => (
              <article
                key={n.id}
                className="bg-white border border-outline-variant/40 rounded-xl shadow-sm p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-label text-[10px] uppercase tracking-widest">
                      <Megaphone className="size-3" />
                      {n.examLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
                      <CalendarDays className="size-3" />
                      {formatDate(n.releasedOn)}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-[10px] uppercase tracking-widest font-bold",
                      n.isPublished
                        ? "bg-success/10 text-success border border-success/20"
                        : "bg-surface-container-high text-on-surface-variant"
                    )}
                  >
                    {n.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <h2 className="font-headline text-lg font-bold text-on-surface leading-snug">
                  {n.title}
                </h2>
                <p className="font-body text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                  {n.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => togglePublished(n.id)}
                    className="inline-flex items-center gap-1.5 font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary"
                  >
                    {n.isPublished ? (
                      <>
                        <EyeOff className="size-3.5" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" />
                        Publish
                      </>
                    )}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(n.id);
                        setShowForm(true);
                      }}
                      className="size-8 inline-flex items-center justify-center rounded text-primary hover:bg-primary/10"
                      aria-label="Edit"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(n.id)}
                      className="size-8 inline-flex items-center justify-center rounded text-error hover:bg-error/10"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function NoticeForm({
  notice,
  onClose,
  onSave,
}: {
  notice: Notice | null;
  onClose: () => void;
  onSave: (data: NoticeDraft) => void | Promise<void>;
}) {
  const [title, setTitle] = useState(notice?.title ?? "");
  const [examLabel, setExamLabel] = useState(notice?.examLabel ?? "");
  const [releasedOn, setReleasedOn] = useState(
    notice?.releasedOn ?? new Date().toISOString().slice(0, 10)
  );
  const [description, setDescription] = useState(notice?.description ?? "");
  const [isPublished, setIsPublished] = useState(notice?.isPublished ?? true);

  return (
    <div className="bg-white border border-outline-variant/40 rounded-xl p-5 md:p-6 shadow-sm flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="font-headline text-lg font-bold text-on-surface">
          {notice ? "Edit Notice" : "New Notice"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
        >
          Close
        </button>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-white font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Exam Label</label>
          <input
            value={examLabel}
            onChange={(e) => setExamLabel(e.target.value)}
            placeholder="e.g. B.Tech V Semester"
            className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-white font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Release Date</label>
          <input
            type="date"
            value={releasedOn}
            onChange={(e) => setReleasedOn(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-white font-body text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="md:col-span-2 flex flex-col gap-1.5">
          <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-outline-variant/50 bg-white font-body text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <label className="md:col-span-2 inline-flex items-center gap-2 font-body text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="size-4"
          />
          Publish on public portal immediately
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-outline-variant/50 text-on-surface hover:bg-surface-container-low font-label text-xs uppercase tracking-widest"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() =>
            void onSave({ title, examLabel, releasedOn, description, isPublished })
          }
          disabled={!title || !examLabel || !releasedOn}
          className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label text-xs uppercase tracking-widest font-bold disabled:opacity-60 hover:bg-primary-container hover:text-white transition-colors"
        >
          {notice ? "Update Notice" : "Create Notice"}
        </button>
      </div>
    </div>
  );
}
