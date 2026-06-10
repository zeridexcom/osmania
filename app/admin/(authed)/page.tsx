import Link from "next/link";
import {
  School,
  TrendingUp,
  Clock,
  Search,
  ChevronDown,
  Plus,
  ArrowRight,
} from "lucide-react";
import { serverGetAdminDashboard } from "@/lib/data/server";
import { isAdminApiConfigured } from "@/lib/data/env";

export const dynamic = "force-dynamic";

const COLORS = [
  { bg: "bg-primary/5", text: "text-primary" },
  { bg: "bg-secondary/10", text: "text-secondary" },
  { bg: "bg-success/10", text: "text-success" },
];

export default async function AdminDashboardPage() {
  let stats: Awaited<ReturnType<typeof serverGetAdminDashboard>>;

  if (isAdminApiConfigured()) {
    stats = await serverGetAdminDashboard();
  } else {
    stats = {
      totalStudents: 0,
      addedThisMonth: 0,
      latestExam: { label: "—", detail: "No exam data" },
      activeNotices: 0,
      recentStudents: [],
    };
  }

  const recent = stats.recentStudents.map((s) => ({
    id: s.id,
    hallTicket: s.hallTicket,
    name: s.name,
    course: s.course,
    createdAt: s.createdAt,
    status: "Verified",
  }));

  const statCards = [
    { label: "Total Enrolled", value: stats.totalStudents.toLocaleString("en-IN"), icon: School },
    { label: "Pass Rate", value: "87%", icon: TrendingUp },
    { label: "Recent Activity", value: stats.addedThisMonth.toLocaleString("en-IN"), icon: Clock },
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="font-headline text-2xl font-bold text-on-surface">Admin Dashboard</h1>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Real-time administrative metrics and result management overview.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            const color = COLORS[i];
            return (
              <div key={card.label} className="admin-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="admin-stat-label">{card.label}</span>
                  <div className={`size-10 rounded-lg ${color.bg} ${color.text} flex items-center justify-center`}>
                    <Icon className="size-5" />
                  </div>
                </div>
                <p className="admin-stat-value">{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Results Repository */}
        <div className="admin-card">
          <div className="px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-on-surface">Results Repository</h2>
            <Link
              href="/admin/students/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg font-label text-xs font-bold hover:bg-primary-container hover:text-white transition-colors shadow-sm"
            >
              <Plus className="size-3.5" />
              Add New
            </Link>
          </div>
          <div className="p-5 border-b border-outline-variant/40">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none size-4" />
                <input
                  type="text"
                  placeholder="Search by Hall Ticket or Name..."
                  className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-lg bg-white font-body text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="relative">
                <select className="appearance-none bg-white border border-outline-variant rounded-lg py-2 pl-4 pr-9 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-all">
                  <option>All Courses</option>
                  <option>Engineering</option>
                  <option>Arts</option>
                  <option>Science</option>
                  <option>Commerce</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
              </div>
              <div className="relative">
                <select className="appearance-none bg-white border border-outline-variant rounded-lg py-2 pl-4 pr-9 font-body text-sm text-on-surface focus:outline-none focus:border-primary transition-all">
                  <option>All Status</option>
                  <option>PASS</option>
                  <option>FAIL</option>
                  <option>PENDING</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant size-4" />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="admin-table-header border-b border-outline-variant/40">
                  <th className="py-3.5 px-5 font-semibold">Name</th>
                  <th className="py-3.5 px-5 font-semibold">Roll No</th>
                  <th className="py-3.5 px-5 font-semibold">Course</th>
                  <th className="py-3.5 px-5 font-semibold">Year</th>
                  <th className="py-3.5 px-5 font-semibold">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {recent.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3.5 px-5 font-body text-sm font-medium text-on-surface">{r.name}</td>
                    <td className="py-3.5 px-5 font-mono text-sm text-on-surface-variant">{r.hallTicket}</td>
                    <td className="py-3.5 px-5 font-body text-sm text-on-surface-variant">{r.course}</td>
                    <td className="py-3.5 px-5 font-body text-sm text-on-surface-variant">2024</td>
                    <td className="py-3.5 px-5">
                      <span className={r.status === "Verified" ? "admin-badge-pass" : "admin-badge-fail"}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link href={`/admin/students/${r.id}/edit`} className="font-label text-xs text-primary hover:underline font-semibold">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3.5 bg-muted/30 border-t border-outline-variant/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 border border-outline-variant rounded-lg font-label text-xs text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50">
                Previous
              </button>
              <span className="font-body text-sm text-on-surface-variant px-2">Page 1 of 10</span>
              <button className="px-3 py-1.5 border border-outline-variant rounded-lg font-label text-xs text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50">
                Next
              </button>
            </div>
            <Link
              href="/admin/students"
              className="inline-flex items-center gap-1 font-label text-xs text-primary hover:underline font-semibold"
            >
              View All Records
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
