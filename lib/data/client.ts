import type {
  Notice,
  PublicStudentResult,
  Student,
} from "@/lib/types";
import type { StudentInput, NoticeInput } from "@/lib/validators";
import { isApiConfigured } from "./env";
import {
  mockCreateNotice,
  mockCreateStudent,
  mockDeleteNotice,
  mockDeleteStudent,
  mockGetAllNotices,
  mockGetAllStudents,
  mockGetStudentByHtno,
  mockGetStudentById,
  mockUpdateNotice,
  mockUpdateStudent,
} from "./mock-state";

async function call<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function clientGetPublicStudentResult(
  hallTicket: string,
  examYear: number
): Promise<PublicStudentResult | null> {
  if (!isApiConfigured()) return mockGetStudentByHtno(hallTicket, examYear);
  const res = await fetch("/api/result/lookup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hallTicket, examYear }),
    credentials: "include",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Lookup failed: ${res.status}`);
  const data = (await res.json()) as { result: PublicStudentResult };
  return data.result;
}

export async function clientGetPublicNotices(): Promise<Notice[]> {
  if (!isApiConfigured()) {
    return mockGetAllNotices().filter((n) => n.isPublished);
  }
  const data = await call<{ data: Notice[] }>("/api/notices");
  return data.data;
}

export interface ClientStudentFilters {
  course?: string;
  semester?: number;
  examYear?: number;
  q?: string;
  page?: number;
  pageSize?: number;
}

export async function clientGetAdminStudents(
  filters: ClientStudentFilters = {}
): Promise<{ items: Student[]; total: number; page: number; pageSize: number }> {
  if (!isApiConfigured()) {
    let items = mockGetAllStudents();
    if (filters.course) items = items.filter((s) => s.course === filters.course);
    if (filters.semester) items = items.filter((s) => s.semester === filters.semester);
    if (filters.examYear) items = items.filter((s) => s.examYear === filters.examYear);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      items = items.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.hallTicket.toLowerCase().includes(q) ||
          s.collegeName.toLowerCase().includes(q)
      );
    }
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 10;
    const from = (page - 1) * pageSize;
    return {
      items: items.slice(from, from + pageSize),
      total: items.length,
      page,
      pageSize,
    };
  }
  const params = new URLSearchParams();
  if (filters.course) params.set("course", filters.course);
  if (filters.semester !== undefined) params.set("semester", String(filters.semester));
  if (filters.examYear !== undefined) params.set("examYear", String(filters.examYear));
  if (filters.q) params.set("q", filters.q);
  params.set("page", String(filters.page ?? 1));
  params.set("pageSize", String(filters.pageSize ?? 10));
  const qs = params.toString();
  const data = await call<{ data: Student[]; page: number; pageSize: number; total: number }>(
    `/api/admin/students?${qs}`
  );
  return {
    items: data.data,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
  };
}

export async function clientGetAdminStudent(id: string): Promise<Student | null> {
  if (!isApiConfigured()) return mockGetStudentById(id);
  const res = await fetch(`/api/admin/students/${id}`, { credentials: "include" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Get failed: ${res.status}`);
  const data = (await res.json()) as { data: Student };
  return data.data;
}

export async function clientCreateAdminStudent(input: StudentInput): Promise<Student> {
  if (!isApiConfigured()) return mockCreateStudent(input);
  const res = await fetch("/api/admin/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Create failed: ${res.status}`);
  }
  const data = (await res.json()) as { data: Student };
  return data.data;
}

export async function clientUpdateAdminStudent(
  id: string,
  input: Partial<StudentInput>
): Promise<Student> {
  if (!isApiConfigured()) {
    const updated = mockUpdateStudent(id, input);
    if (!updated) throw new Error("not_found");
    return updated;
  }
  const res = await fetch(`/api/admin/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Update failed: ${res.status}`);
  }
  const data = (await res.json()) as { data: Student };
  return data.data;
}

export async function clientDeleteAdminStudent(id: string): Promise<void> {
  if (!isApiConfigured()) {
    mockDeleteStudent(id);
    return;
  }
  const res = await fetch(`/api/admin/students/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed: ${res.status}`);
  }
}

export async function clientGetAdminNotices(
  includeUnpublished: boolean = true
): Promise<Notice[]> {
  if (!isApiConfigured()) {
    const all = mockGetAllNotices();
    return includeUnpublished ? all : all.filter((n) => n.isPublished);
  }
  const qs = includeUnpublished ? "?includeUnpublished=true" : "";
  const data = await call<{ data: Notice[] }>(`/api/admin/notices${qs}`);
  return data.data;
}

export async function clientCreateAdminNotice(input: NoticeInput): Promise<Notice> {
  if (!isApiConfigured()) return mockCreateNotice(input);
  const res = await fetch("/api/admin/notices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Create failed: ${res.status}`);
  }
  const data = (await res.json()) as { data: Notice };
  return data.data;
}

export async function clientUpdateAdminNotice(
  id: string,
  input: Partial<NoticeInput>
): Promise<Notice> {
  if (!isApiConfigured()) {
    const updated = mockUpdateNotice(id, input);
    if (!updated) throw new Error("not_found");
    return updated;
  }
  const res = await fetch(`/api/admin/notices/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Update failed: ${res.status}`);
  }
  const data = (await res.json()) as { data: Notice };
  return data.data;
}

export async function clientDeleteAdminNotice(id: string): Promise<void> {
  if (!isApiConfigured()) {
    mockDeleteNotice(id);
    return;
  }
  const res = await fetch(`/api/admin/notices/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Delete failed: ${res.status}`);
  }
}

export async function clientAdminLogin(
  username: string,
  password: string
): Promise<{ ok: boolean; username?: string; error?: string }> {
  if (!isApiConfigured()) {
    if (!username.trim() || !password) {
      return { ok: false, error: "Both username and password are required." };
    }
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    return { ok: true, username: username.trim() };
  }
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  if (res.ok) {
    const data = (await res.json()) as { ok: boolean; username?: string };
    return { ok: data.ok, username: data.username };
  }
  if (res.status === 401) return { ok: false, error: "Invalid username or password" };
  return { ok: false, error: `Login failed: ${res.status}` };
}

export async function clientAdminLogout(): Promise<void> {
  if (!isApiConfigured()) return;
  await fetch("/api/admin/logout", {
    method: "POST",
    credentials: "include",
  });
}

export async function clientGetAdminMe(): Promise<{ username: string } | null> {
  if (!isApiConfigured()) return { username: "admin" };
  const res = await fetch("/api/admin/me", { credentials: "include" });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  const data = (await res.json()) as { username: string };
  return { username: data.username };
}
