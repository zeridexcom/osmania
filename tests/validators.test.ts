import { describe, expect, it } from "vitest";

import {
  adminLoginSchema,
  noticeInputSchema,
  noticeUpdateSchema,
  publicLookupSchema,
  studentInputSchema,
  studentListQuerySchema,
  studentUpdateSchema,
  subjectInputSchema,
} from "@/lib/validators";

const validSubject = {
  code: "CS401",
  name: "Operating Systems",
  credits: 4,
  internalMax: 30,
  internalObtained: 28,
  externalMax: 70,
  externalObtained: 64,
};

const validStudent = {
  hallTicket: "160321733001",
  name: "Aarav Sharma",
  fatherName: "Rajesh Sharma",
  motherName: "Priya Sharma",
  dob: "2002-08-14",
  course: "BTECH" as const,
  branch: "CSE",
  regulation: "CBCS" as const,
  semester: 4,
  examMonth: "MAY",
  examYear: 2024,
  collegeCode: "1603",
  collegeName: "UCE",
  subjects: [validSubject],
};

describe("subjectInputSchema", () => {
  it("accepts a valid subject", () => {
    expect(subjectInputSchema.safeParse(validSubject).success).toBe(true);
  });

  it("rejects negative credits", () => {
    const r = subjectInputSchema.safeParse({ ...validSubject, credits: -1 });
    expect(r.success).toBe(false);
  });

  it("rejects internalObtained > internalMax", () => {
    const r = subjectInputSchema.safeParse({
      ...validSubject,
      internalObtained: 50,
    });
    expect(r.success).toBe(false);
  });

  it("rejects externalObtained > externalMax", () => {
    const r = subjectInputSchema.safeParse({
      ...validSubject,
      externalObtained: 80,
    });
    expect(r.success).toBe(false);
  });

  it("rejects empty code", () => {
    const r = subjectInputSchema.safeParse({ ...validSubject, code: "" });
    expect(r.success).toBe(false);
  });
});

describe("studentInputSchema", () => {
  it("accepts a valid student", () => {
    expect(studentInputSchema.safeParse(validStudent).success).toBe(true);
  });

  it("normalises hall_ticket to uppercase", () => {
    const r = studentInputSchema.safeParse({
      ...validStudent,
      hallTicket: "abc123",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.hallTicket).toBe("ABC123");
    }
  });

  it("rejects an invalid course code", () => {
    const r = studentInputSchema.safeParse({ ...validStudent, course: "ZZZ" });
    expect(r.success).toBe(false);
  });

  it("rejects an out-of-range semester", () => {
    const r = studentInputSchema.safeParse({ ...validStudent, semester: 11 });
    expect(r.success).toBe(false);
  });

  it("rejects zero subjects", () => {
    const r = studentInputSchema.safeParse({ ...validStudent, subjects: [] });
    expect(r.success).toBe(false);
  });

  it("rejects more than 50 subjects", () => {
    const tooMany = Array.from({ length: 51 }, () => validSubject);
    const r = studentInputSchema.safeParse({ ...validStudent, subjects: tooMany });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid dob", () => {
    const r = studentInputSchema.safeParse({ ...validStudent, dob: "not-a-date" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid hall ticket", () => {
    const r = studentInputSchema.safeParse({
      ...validStudent,
      hallTicket: "ab",
    });
    expect(r.success).toBe(false);
  });
});

describe("studentUpdateSchema", () => {
  it("accepts a partial update", () => {
    expect(
      studentUpdateSchema.safeParse({ name: "New Name" }).success
    ).toBe(true);
  });

  it("rejects an invalid course even when partial", () => {
    expect(studentUpdateSchema.safeParse({ course: "ZZZ" }).success).toBe(false);
  });
});

describe("noticeInputSchema", () => {
  const validNotice = {
    title: "B.Tech Results",
    description: "Results are out.",
    examLabel: "B.Tech IV Sem — May 2024",
    releasedOn: "2024-06-15",
  };

  it("accepts a valid notice", () => {
    expect(noticeInputSchema.safeParse(validNotice).success).toBe(true);
  });

  it("defaults isPublished to true", () => {
    const r = noticeInputSchema.safeParse(validNotice);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.isPublished).toBe(true);
    }
  });

  it("rejects an empty title", () => {
    expect(
      noticeInputSchema.safeParse({ ...validNotice, title: "" }).success
    ).toBe(false);
  });

  it("rejects an invalid date", () => {
    expect(
      noticeInputSchema.safeParse({ ...validNotice, releasedOn: "tomorrow" })
        .success
    ).toBe(false);
  });
});

describe("noticeUpdateSchema", () => {
  it("accepts a partial update", () => {
    expect(noticeUpdateSchema.safeParse({ title: "New" }).success).toBe(true);
  });
});

describe("publicLookupSchema", () => {
  it("accepts a valid lookup", () => {
    expect(
      publicLookupSchema.safeParse({
        hallTicket: "160321733001",
        examYear: 2024,
      }).success
    ).toBe(true);
  });

  it("rejects a short hall ticket", () => {
    expect(
      publicLookupSchema.safeParse({ hallTicket: "abc", examYear: 2024 })
        .success
    ).toBe(false);
  });

  it("rejects an out-of-range exam year", () => {
    expect(
      publicLookupSchema.safeParse({ hallTicket: "160321733001", examYear: 1500 })
        .success
    ).toBe(false);
    expect(
      publicLookupSchema.safeParse({ hallTicket: "160321733001", examYear: 3000 })
        .success
    ).toBe(false);
  });
});

describe("adminLoginSchema", () => {
  it("accepts a valid login", () => {
    expect(
      adminLoginSchema.safeParse({ username: "admin", password: "longenough" })
        .success
    ).toBe(true);
  });

  it("rejects a short password", () => {
    expect(
      adminLoginSchema.safeParse({ username: "admin", password: "short" })
        .success
    ).toBe(false);
  });
});

describe("studentListQuerySchema", () => {
  it("applies sensible defaults", () => {
    const r = studentListQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.page).toBe(1);
      expect(r.data.pageSize).toBe(10);
    }
  });

  it("rejects out-of-range page", () => {
    expect(studentListQuerySchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it("rejects an oversized pageSize", () => {
    expect(studentListQuerySchema.safeParse({ pageSize: 1000 }).success).toBe(
      false
    );
  });
});
