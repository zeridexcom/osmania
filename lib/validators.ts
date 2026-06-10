import { z } from "zod";

import type { CourseCode, Regulation, ResultStatus } from "./types";

const courseCodes = [
  "BA",
  "BCOM",
  "BSC",
  "BBA",
  "BCA",
  "BE",
  "BTECH",
  "MA",
  "MCOM",
  "MSC",
  "MBA",
  "MCA",
] as const satisfies readonly CourseCode[];

const regulations = ["CBCS", "NON_CBCS", "AICTE_MODEL"] as const satisfies readonly Regulation[];

const resultStatuses = [
  "PASS",
  "FAIL",
  "PENDING",
  "WITH_HELD",
] as const satisfies readonly ResultStatus[];

export const subjectInputSchema = z
  .object({
    code: z.string().trim().min(1).max(40),
    name: z.string().trim().min(1).max(200),
    credits: z.coerce.number().positive().max(20),
    internalMax: z.coerce.number().int().min(0).max(100),
    internalObtained: z.coerce.number().int().min(0).max(100),
    externalMax: z.coerce.number().int().min(0).max(200),
    externalObtained: z.coerce.number().int().min(0).max(200),
  })
  .superRefine((val, ctx) => {
    if (val.internalObtained > val.internalMax) {
      ctx.addIssue({
        code: "custom",
        path: ["internalObtained"],
        message: "internalObtained cannot exceed internalMax",
      });
    }
    if (val.externalObtained > val.externalMax) {
      ctx.addIssue({
        code: "custom",
        path: ["externalObtained"],
        message: "externalObtained cannot exceed externalMax",
      });
    }
  });

export const studentInputSchema = z.object({
  hallTicket: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,20}$/, "hallTicket must be 6-20 alphanumeric chars"),
  name: z.string().trim().min(1).max(200),
  fatherName: z.string().trim().min(1).max(200),
  motherName: z.string().trim().min(1).max(200),
  dob: z.iso.date(),
  course: z.enum(courseCodes),
  branch: z.string().trim().min(1).max(120),
  regulation: z.enum(regulations),
  semester: z.coerce.number().int().min(1).max(10),
  examMonth: z.string().trim().min(1).max(20),
  examYear: z.coerce.number().int().min(2000).max(2100),
  collegeCode: z.string().trim().min(1).max(40),
  collegeName: z.string().trim().min(1).max(200),
  cgpa: z.coerce.number().min(0).max(10).nullable().optional(),
  resultStatus: z.enum(resultStatuses).optional(),
  subjects: z.array(subjectInputSchema).min(1).max(50),
});

export const studentUpdateSchema = z.object({
  hallTicket: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,20}$/)
    .optional(),
  name: z.string().trim().min(1).max(200).optional(),
  fatherName: z.string().trim().min(1).max(200).optional(),
  motherName: z.string().trim().min(1).max(200).optional(),
  dob: z.iso.date().optional(),
  course: z.enum(courseCodes).optional(),
  branch: z.string().trim().min(1).max(120).optional(),
  regulation: z.enum(regulations).optional(),
  semester: z.coerce.number().int().min(1).max(10).optional(),
  examMonth: z.string().trim().min(1).max(20).optional(),
  examYear: z.coerce.number().int().min(2000).max(2100).optional(),
  collegeCode: z.string().trim().min(1).max(40).optional(),
  collegeName: z.string().trim().min(1).max(200).optional(),
  cgpa: z.coerce.number().min(0).max(10).nullable().optional(),
  resultStatus: z.enum(resultStatuses).optional(),
  subjects: z.array(subjectInputSchema).min(1).max(50).optional(),
});

export const noticeInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(4000),
  examLabel: z.string().trim().min(1).max(120),
  releasedOn: z.iso.date(),
  isPublished: z.boolean().optional().default(true),
});

export const noticeUpdateSchema = noticeInputSchema.partial();

export const publicLookupSchema = z.object({
  hallTicket: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{6,20}$/, "hallTicket must be 6-20 alphanumeric chars"),
  examYear: z.coerce.number().int().min(2000).max(2100),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(200),
});

export const studentListQuerySchema = z.object({
  course: z.enum(courseCodes).optional(),
  semester: z.coerce.number().int().min(1).max(10).optional(),
  examYear: z.coerce.number().int().min(2000).max(2100).optional(),
  q: z.string().trim().min(1).max(120).optional(),
  page: z.coerce.number().int().min(1).max(10000).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type StudentInput = z.infer<typeof studentInputSchema>;
export type SubjectInput = z.infer<typeof subjectInputSchema>;
export type NoticeInput = z.infer<typeof noticeInputSchema>;
export type PublicLookup = z.infer<typeof publicLookupSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type StudentListQuery = z.infer<typeof studentListQuerySchema>;
