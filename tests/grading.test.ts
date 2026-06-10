import { describe, expect, it } from "vitest";

import {
  GRADING_TABLE,
  computeGrade,
  computeResultStatus,
  computeSgpa,
  computeSubjectTotals,
  finalizeSubject,
  gradePointsFor,
  sanitizeForPublic,
} from "@/lib/grading";
import type { Student, Subject } from "@/lib/types";

describe("computeGrade", () => {
  it("maps boundaries correctly", () => {
    expect(computeGrade(100)).toBe("O");
    expect(computeGrade(90)).toBe("O");
    expect(computeGrade(89.99)).toBe("A+");
    expect(computeGrade(80)).toBe("A+");
    expect(computeGrade(79.99)).toBe("A");
    expect(computeGrade(70)).toBe("A");
    expect(computeGrade(69.99)).toBe("B+");
    expect(computeGrade(60)).toBe("B+");
    expect(computeGrade(59.99)).toBe("B");
    expect(computeGrade(50)).toBe("B");
    expect(computeGrade(49.99)).toBe("C");
    expect(computeGrade(40)).toBe("C");
    expect(computeGrade(39.99)).toBe("D");
    expect(computeGrade(36)).toBe("D");
    expect(computeGrade(35.99)).toBe("F");
    expect(computeGrade(0)).toBe("F");
  });

  it("throws on out-of-range percentage", () => {
    expect(() => computeGrade(-0.01)).toThrow();
    expect(() => computeGrade(100.01)).toThrow();
  });
});

describe("gradePointsFor", () => {
  it("returns the correct points for each grade", () => {
    expect(gradePointsFor("O")).toBe(10);
    expect(gradePointsFor("A+")).toBe(9);
    expect(gradePointsFor("A")).toBe(8);
    expect(gradePointsFor("B+")).toBe(7);
    expect(gradePointsFor("B")).toBe(6);
    expect(gradePointsFor("C")).toBe(5);
    expect(gradePointsFor("D")).toBe(4);
    expect(gradePointsFor("F")).toBe(0);
  });
});

describe("computeSubjectTotals", () => {
  it("sums internal and external marks", () => {
    const result = computeSubjectTotals({
      internalObtained: 25,
      externalObtained: 56,
      internalMax: 30,
      externalMax: 70,
    });
    expect(result.totalMax).toBe(100);
    expect(result.totalObtained).toBe(81);
    expect(result.grade).toBe("A+");
    expect(result.gradePoints).toBe(9);
  });

  it("returns F when both scores are zero", () => {
    const result = computeSubjectTotals({
      internalObtained: 0,
      externalObtained: 0,
      internalMax: 30,
      externalMax: 70,
    });
    expect(result.grade).toBe("F");
    expect(result.gradePoints).toBe(0);
  });
});

describe("finalizeSubject", () => {
  it("produces a Subject with computed totals", () => {
    const out = finalizeSubject({
      code: "CS401",
      name: "Operating Systems",
      credits: 4,
      internalMax: 30,
      internalObtained: 28,
      externalMax: 70,
      externalObtained: 64,
    });
    expect(out.totalMax).toBe(100);
    expect(out.totalObtained).toBe(92);
    expect(out.grade).toBe("O");
    expect(out.gradePoints).toBe(10);
  });
});

describe("computeSgpa", () => {
  it("returns weighted average rounded to 2 decimals", () => {
    const subjects: Subject[] = [
      {
        code: "A",
        name: "A",
        credits: 4,
        internalMax: 30,
        internalObtained: 28,
        externalMax: 70,
        externalObtained: 64,
        totalMax: 100,
        totalObtained: 92,
        grade: "O",
        gradePoints: 10,
      },
      {
        code: "B",
        name: "B",
        credits: 3,
        internalMax: 30,
        internalObtained: 25,
        externalMax: 70,
        externalObtained: 55,
        totalMax: 100,
        totalObtained: 80,
        grade: "A+",
        gradePoints: 9,
      },
    ];
    const sgpa = computeSgpa(subjects);
    expect(sgpa).toBe(9.57);
  });

  it("returns 0 when no subjects have credits", () => {
    expect(
      computeSgpa([
        {
          code: "X",
          name: "X",
          credits: 0,
          internalMax: 30,
          internalObtained: 0,
          externalMax: 70,
          externalObtained: 0,
          totalMax: 100,
          totalObtained: 0,
          grade: "F",
          gradePoints: 0,
        },
      ])
    ).toBe(0);
  });

  it("returns 0 for empty array", () => {
    expect(computeSgpa([])).toBe(0);
  });
});

describe("computeResultStatus", () => {
  const passSub = (grade: Subject["grade"]): Subject => ({
    code: "X",
    name: "X",
    credits: 4,
    internalMax: 30,
    internalObtained: 20,
    externalMax: 70,
    externalObtained: 40,
    totalMax: 100,
    totalObtained: 60,
    grade,
    gradePoints: gradePointsFor(grade),
  });

  it("returns PASS when all grades >= D and sgpa >= 5", () => {
    const subjects = [passSub("C"), passSub("B")];
    const sgpa = computeSgpa(subjects);
    expect(computeResultStatus(subjects, sgpa)).toBe("PASS");
  });

  it("returns FAIL when any subject is F", () => {
    const subjects = [passSub("O"), passSub("F")];
    const sgpa = computeSgpa([passSub("O")]);
    expect(computeResultStatus(subjects, sgpa)).toBe("FAIL");
  });

  it("returns FAIL when sgpa < 5 even with no F", () => {
    const subjects = [passSub("D"), passSub("D")];
    expect(computeResultStatus(subjects, 4.99)).toBe("FAIL");
  });

  it("returns PENDING for empty subjects", () => {
    expect(computeResultStatus([], 0)).toBe("PENDING");
  });
});

describe("sanitizeForPublic", () => {
  const baseStudent: Student = {
    id: "abc-123",
    hallTicket: "160321733001",
    name: "Aarav Sharma",
    fatherName: "Rajesh Sharma",
    motherName: "Priya Sharma",
    dob: "2002-08-14",
    course: "BTECH",
    branch: "CSE",
    regulation: "CBCS",
    semester: 4,
    examMonth: "MAY",
    examYear: 2024,
    collegeCode: "1603",
    collegeName: "UCE",
    sgpa: 8.42,
    cgpa: 8.18,
    resultStatus: "PASS",
    subjects: [
      {
        id: "sub-1",
        code: "CS401",
        name: "OS",
        credits: 4,
        internalMax: 30,
        internalObtained: 28,
        externalMax: 70,
        externalObtained: 64,
        totalMax: 100,
        totalObtained: 92,
        grade: "O",
        gradePoints: 10,
      },
    ],
    createdAt: "2024-06-15T10:00:00.000Z",
    updatedAt: "2024-06-15T10:00:00.000Z",
  };

  it("strips id, updatedAt from the student root but keeps createdAt", () => {
    const pub = sanitizeForPublic(baseStudent);
    expect((pub as unknown as { id?: string }).id).toBeUndefined();
    expect(pub.createdAt).toBe("2024-06-15T10:00:00.000Z");
    expect((pub as unknown as { updatedAt?: string }).updatedAt).toBeUndefined();
  });

  it("preserves public fields and subjects", () => {
    const pub = sanitizeForPublic(baseStudent);
    expect(pub.hallTicket).toBe("160321733001");
    expect(pub.subjects).toHaveLength(1);
    expect(pub.subjects[0]?.code).toBe("CS401");
  });
});

describe("GRADING_TABLE", () => {
  it("exposes 8 rows with correct order", () => {
    expect(GRADING_TABLE).toHaveLength(8);
    expect(GRADING_TABLE[0]?.grade).toBe("O");
    expect(GRADING_TABLE.at(-1)?.grade).toBe("F");
  });
});
