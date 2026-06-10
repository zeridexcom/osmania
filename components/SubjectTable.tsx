import type { Subject } from "@/lib/types";

interface SubjectTableProps {
  subjects: Subject[];
}

export function SubjectTable({ subjects }: SubjectTableProps) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-surface-container-low">
          <th className="py-3 px-4 font-label font-semibold text-sm text-on-surface border-b border-outline-variant/50">
            Subject Code
          </th>
          <th className="py-3 px-4 font-label font-semibold text-sm text-on-surface border-b border-outline-variant/50">
            Subject Name
          </th>
          <th className="py-3 px-4 font-label font-semibold text-sm text-on-surface border-b border-outline-variant/50 text-right">
            Internal
          </th>
          <th className="py-3 px-4 font-label font-semibold text-sm text-on-surface border-b border-outline-variant/50 text-right">
            External
          </th>
          <th className="py-3 px-4 font-label font-semibold text-sm text-on-surface border-b border-outline-variant/50 text-right">
            Total
          </th>
          <th className="py-3 px-4 font-label font-semibold text-sm text-on-surface border-b border-outline-variant/50 text-center">
            Grade
          </th>
          <th className="py-3 px-4 font-label font-semibold text-sm text-on-surface border-b border-outline-variant/50 text-center">
            Credits
          </th>
        </tr>
      </thead>
      <tbody className="font-body text-sm">
        {subjects.map((s, i) => (
          <tr
            key={s.code}
            className={`border-b border-surface-container-highest hover:bg-surface-container-lowest transition-colors ${
              i % 2 === 1 ? "bg-surface-container-lowest" : ""
            }`}
          >
            <td className="py-3 px-4 text-on-surface-variant">{s.code}</td>
            <td className="py-3 px-4 text-on-surface font-medium">{s.name}</td>
            <td className="py-3 px-4 text-right text-on-surface-variant">
              {s.internalObtained}
            </td>
            <td className="py-3 px-4 text-right text-on-surface-variant">
              {s.externalObtained}
            </td>
            <td className="py-3 px-4 text-right font-medium text-on-surface">
              {s.totalObtained}
            </td>
            <td className="py-3 px-4 text-center">
              <span
                className={
                  s.grade === "F"
                    ? "inline-flex items-center justify-center px-2 py-0.5 rounded font-label text-xs font-bold text-error"
                    : "inline-flex items-center justify-center px-2 py-0.5 rounded font-label text-xs font-bold text-primary"
                }
              >
                {s.grade}
              </span>
            </td>
            <td className="py-3 px-4 text-center text-on-surface-variant">{s.credits}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
