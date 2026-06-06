// lib/validations.ts
// Zod schemas for API input validation.

import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

export const collegeListSchema = z
  .object({
    search: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(100).optional()),
    location: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
    city: z.preprocess(emptyToUndefined, z.string().trim().max(50).optional()),
    state: z.preprocess(emptyToUndefined, z.string().trim().max(50).optional()),
    minFees: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).optional()),
    maxFees: z.preprocess(emptyToUndefined, z.coerce.number().int().min(0).max(10000000).optional()),
    minRating: z.preprocess(emptyToUndefined, z.coerce.number().min(0).max(5).optional()),
    sort: z.preprocess(emptyToUndefined, z.enum(["rating", "fees-low", "fees-high", "name"]).default("rating")),
    page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(12)),
  })
  .refine(
    (value) => value.minFees === undefined || value.maxFees === undefined || value.minFees <= value.maxFees,
    { message: "minFees must be less than or equal to maxFees", path: ["minFees"] }
  );

export type CollegeListInput = z.infer<typeof collegeListSchema>;

export const collegeIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CollegeIdInput = z.infer<typeof collegeIdSchema>;

export const compareSchema = z
  .object({
    ids: z
      .string()
      .transform((val) => val.split(",").map((id) => Number(id.trim())))
      .pipe(
        z
          .array(z.number().int().positive())
          .min(2, "At least 2 colleges required")
          .max(3, "Maximum 3 colleges allowed")
      ),
  })
  .refine((value) => new Set(value.ids).size === value.ids.length, {
    message: "Duplicate colleges are not allowed",
    path: ["ids"],
  });

export type CompareInput = z.infer<typeof compareSchema>;

export const savedCollegeSchema = z.object({
  collegeId: z.number().int().positive(),
});

export type SavedCollegeInput = z.infer<typeof savedCollegeSchema>;

export const savedComparisonSchema = z.object({
  collegeIds: z
    .array(z.number().int().positive())
    .min(2, "At least 2 colleges required")
    .max(3, "Maximum 3 colleges allowed"),
  title: z.string().trim().min(1).max(120).optional(),
}).refine((value) => new Set(value.collegeIds).size === value.collegeIds.length, {
  message: "Duplicate colleges are not allowed",
  path: ["collegeIds"],
});

export type SavedComparisonInput = z.infer<typeof savedComparisonSchema>;

export const savedComparisonDeleteSchema = z.object({
  id: z.number().int().positive(),
});

export type SavedComparisonDeleteInput = z.infer<typeof savedComparisonDeleteSchema>;

export const reviewPaginationSchema = z.object({
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(20).default(5)),
});

export type ReviewPaginationInput = z.infer<typeof reviewPaginationSchema>;
