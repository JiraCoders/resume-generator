import { z } from "zod";

export function getResumeValidationSchema(experience: string[]) {
  const experienceSchemas = experience.map((_, index) => ({
    [`experience${index + 1}`]: z.object({
      skills: z.array(z.string()),
      records: z.array(z.string())
    }),
    [`roleTitle${index + 1}`]: z.string()
  }));

  const resumeValidationSchema = z.object({
    roleTitle: z.string(),
    summary: z.string(),
    skills: z.array(
      z.object({
        group: z.string(),
        keywords: z.array(z.string())
      })
    ),
    ...experienceSchemas.reduce((acc, curr) => ({ ...acc, ...curr }), {})
  });

  return resumeValidationSchema;
}

export const jobDescriptionValidationSchema = z.object({
  companyName: z.string(),
  roleTitle: z.string(),
  isSecurityClearanceRequired: z.boolean(),
  isRemote: z.boolean()
});

export const coverLetterValidationSchema = z.object({
  name: z.string(),
  content: z.string(),
});

export type JobDescriptionSchema = z.infer<typeof jobDescriptionValidationSchema>;
export type ResumeSchema = z.infer<ReturnType<typeof getResumeValidationSchema>>;
export type CoverLetterSchema = z.infer<typeof coverLetterValidationSchema>;