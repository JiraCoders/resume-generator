import { formatBullets } from "@/lib/utils";
import type { ResumeSchema } from "@/lib/validations";

export function getDocOptions(resume: ResumeSchema) {
  const roleTitleEntries = Object.entries(resume)
    .filter(([key]) => key.startsWith("roleTitle") && resume[key as keyof ResumeSchema])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, roleTitle]) => roleTitle as string);

  const experienceEntries = Object.entries(resume)
    .filter(([key]) => key.startsWith("experience") && resume[key as keyof ResumeSchema])
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, experience]) => formatBullets((experience as unknown as { records: string[] }).records));

  return {
    summary: resume.summary.replace(/\*/g, ""),
    skills: resume.skills.map((skill) => ({
      group: skill.group,
      keywords: skill.keywords.join(", ").replace(/\*/g, "")
    })),
    ...roleTitleEntries.reduce(
      (acc, roleTitle, index) => {
        acc[`role${index + 1}`] = roleTitle;
        return acc;
      },
      {} as Record<string, ReturnType<typeof String>>
    ),
    ...experienceEntries.reduce(
      (acc, bullets, index) => {
        acc[`bullets${index + 1}`] = bullets;
        return acc;
      },
      {} as Record<string, ReturnType<typeof formatBullets>>
    )
  };
}
