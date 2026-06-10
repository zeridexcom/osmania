import { isApiConfigured } from "@/lib/data/env";
import { mockGetStudentByHtno } from "@/lib/data/mock-state";
import { generateVerificationHash, serverGetPublicStudentResult } from "@/lib/data/server";
import type { PublicStudentResult } from "@/lib/types";

export const dynamic = "force-dynamic";

function romanize(num: number): string {
  const map: [number, string][] = [
    [10, "X"], [9, "IX"], [8, "VIII"], [7, "VII"], [6, "VI"],
    [5, "V"], [4, "IV"], [3, "III"], [2, "II"], [1, "I"],
  ];
  let out = "";
  let n = num;
  for (const [value, sym] of map) {
    while (n >= value) {
      out += sym;
      n -= value;
    }
  }
  return out || String(num);
}

function formatDob(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
}

function generateHtml(student: PublicStudentResult): string {
  const hash = generateVerificationHash(student.hallTicket, student.examYear);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Statement of Marks — ${student.hallTicket}</title>
<style>
  @page { size: A4 portrait; margin: 15mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a1a; background: #fff; padding: 20px; }
  .header { text-align: center; border-bottom: 2px solid #800000; padding-bottom: 16px; margin-bottom: 20px; }
  .header h1 { font-size: 22px; color: #800000; margin-bottom: 4px; }
  .header h2 { font-size: 16px; color: #333; font-weight: normal; letter-spacing: 2px; margin-bottom: 4px; }
  .header p { font-size: 11px; color: #666; }
  .info-grid { display: flex; flex-wrap: wrap; gap: 8px 30px; margin-bottom: 20px; font-size: 13px; }
  .info-grid .field { flex: 1 1 40%; border-bottom: 1px solid #ddd; padding: 4px 0; display: flex; justify-content: space-between; }
  .info-grid .field .label { color: #666; font-weight: bold; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; }
  .info-grid .field .value { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
  th { background: #f5f0eb; color: #800000; padding: 8px 6px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #ddd; }
  td { padding: 6px; border: 1px solid #ddd; }
  td.right { text-align: right; }
  td.center { text-align: center; }
  .result-box { border: 2px solid #800000; padding: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; background: #faf8f6; }
  .sgpa-box { text-align: center; }
  .sgpa-box .label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
  .sgpa-box .value { font-size: 28px; font-weight: bold; }
  .status-stamp { font-size: 20px; font-weight: bold; letter-spacing: 3px; padding: 8px 24px; border-radius: 4px; transform: rotate(-2deg); }
  .status-pass { background: #1b4332; color: #fff; }
  .status-fail { background: #ba1a1a; color: #fff; }
  .footer { border-top: 1px solid #ddd; padding-top: 12px; display: flex; justify-content: space-between; font-size: 11px; color: #666; }
  .footer .signature { text-align: right; }
  .footer .signature div { width: 140px; border-bottom: 1px solid #999; margin-bottom: 4px; display: inline-block; }
  .verify-note { font-size: 9px; color: #999; margin-top: 12px; text-align: center; font-style: italic; }
  .verify-hash { font-size: 8px; color: #bbb; text-align: center; margin-top: 4px; font-family: monospace; }
</style>
</head>
<body>
<div class="header">
  <h1>Osmania University</h1>
  <h2>Statement of Marks</h2>
  <p>Re-Accredited by NAAC with 'A+' Grade</p>
</div>

<div class="info-grid">
  <div class="field"><span class="label">Hall Ticket No</span><span class="value">${student.hallTicket}</span></div>
  <div class="field"><span class="label">Name</span><span class="value">${student.name.toUpperCase()}</span></div>
  <div class="field"><span class="label">Father's Name</span><span class="value">${student.fatherName.toUpperCase()}</span></div>
  <div class="field"><span class="label">DOB</span><span class="value">${formatDob(student.dob)}</span></div>
  <div class="field"><span class="label">Course</span><span class="value">${student.course}</span></div>
  <div class="field"><span class="label">Branch</span><span class="value">${student.branch.toUpperCase()}</span></div>
  <div class="field"><span class="label">Semester</span><span class="value">${romanize(student.semester)} (${student.examMonth.toUpperCase()} ${student.examYear})</span></div>
  <div class="field"><span class="label">College</span><span class="value">${student.collegeName.toUpperCase()}</span></div>
</div>

<table>
  <thead>
    <tr><th>Code</th><th>Subject Name</th><th class="right">Int.</th><th class="right">Ext.</th><th class="right">Total</th><th class="center">Grade</th><th class="center">Credits</th></tr>
  </thead>
  <tbody>
    ${student.subjects.map(s => `
    <tr>
      <td style="font-family:monospace;font-size:11px">${s.code}</td>
      <td>${s.name}</td>
      <td class="right">${s.internalObtained !== null ? s.internalObtained : '—'}</td>
      <td class="right">${s.externalObtained !== null ? s.externalObtained : '—'}</td>
      <td class="right">${s.totalObtained !== null ? s.totalObtained : '—'}</td>
      <td class="center" style="font-weight:bold;color:#800000">${s.grade}</td>
      <td class="center">${s.credits}</td>
    </tr>`).join('')}
  </tbody>
</table>

<div class="result-box">
  <div class="sgpa-box">
    <div class="label">SGPA</div>
    <div class="value">${student.sgpa.toFixed(2)}</div>
  </div>
  ${student.cgpa !== null ? `<div class="sgpa-box"><div class="label">CGPA</div><div class="value">${student.cgpa.toFixed(2)}</div></div>` : ''}
  <div class="status-stamp ${student.resultStatus === 'PASS' ? 'status-pass' : 'status-fail'}">${student.resultStatus}</div>
</div>

<div class="footer">
  <div>
    <div>Date of Publication: ${student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</div>
    <div style="font-style:italic;color:#999;margin-top:4px">This is a computer-generated statement and does not require a physical signature.</div>
  </div>
  <div class="signature">
    <div></div>
    <div>Controller of Examinations</div>
  </div>
</div>

<div class="verify-note">This result is digitally authenticated. Verify at https://ouresults.example.com</div>
<div class="verify-hash">Verification Hash: ${hash}</div>
</body>
</html>`;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ hallTicket: string }> }
) {
  const { hallTicket } = await params;
  const url = new URL(_request.url);
  const searchParams = url.searchParams;
  const examYearStr = searchParams.get("examYear");

  if (!examYearStr) {
    return Response.json({ error: "Missing examYear query parameter" }, { status: 400 });
  }

  const examYear = Number(examYearStr);
  if (!Number.isFinite(examYear)) {
    return Response.json({ error: "Invalid examYear" }, { status: 400 });
  }

  let student: PublicStudentResult | null = null;
  if (isApiConfigured()) {
    try {
      student = await serverGetPublicStudentResult(hallTicket, examYear);
    } catch (err) {
      return Response.json({ error: "lookup_failed", message: (err as Error).message }, { status: 500 });
    }
  } else {
    student = mockGetStudentByHtno(hallTicket, examYear);
  }

  if (!student) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }

  const html = generateHtml(student);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="OU_Result_${hallTicket}.html"`,
    },
  });
}
