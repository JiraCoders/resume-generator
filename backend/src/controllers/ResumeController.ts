import prompt from "@/config/prompt.json";
import {
  OPENAI_MAX_TOKENS,
  OPENAI_MODEL_NAME,
  OPENAI_TEMPERATURE,
  ZOD_RESPONSE_FORMAT_NAME
} from "@/config/promptConfig";
import { JobStatus } from "@/lib/enums";
import { ResumeTailorRequestBody } from "@/lib/types";
import { createJiracodersApplication,
  exportJobDescription,
  exportResume,
  exportCoverLetter,
  isExistingCompanyName,
  findDeepestFolders,
} from "@/lib/utils";
import {
  getResumeValidationSchema,
  JobDescriptionSchema,
  jobDescriptionValidationSchema,
  ResumeSchema,
  coverLetterValidationSchema,
  CoverLetterSchema
} from "@/lib/validations";
import type { Request, Response } from "express";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { ChatCompletionMessageParam } from "openai/resources";
import * as path from 'path';
import * as fs from 'fs';

export default class ResumeController {
  static async tailorResume(req: Request, res: Response) {
    const {
      id,
      tabId,
      name,
      experience,
      description,
      template,
      apiKey,
      folderPath,
      isConvertPDF,
      isOpenResume,
      isFilterSecurityClearance,
      isFilterRemote
    } = req.body as ResumeTailorRequestBody;
    const openAI = new OpenAI({ apiKey });
    const userMessages = prompt.resume.user_prompts as ChatCompletionMessageParam[];
    const coverLetterUserPrmpts = prompt.cover_letter.user_prompts as ChatCompletionMessageParam[];
    const resumeValidationSchema = getResumeValidationSchema(experience);

    try {
      const jdCompletion = await openAI.beta.chat.completions.parse({
        model: OPENAI_MODEL_NAME,
        temperature: OPENAI_TEMPERATURE,
        max_tokens: OPENAI_MAX_TOKENS,
        messages: [
          {
            role: "system",
            content: prompt.job_description.sys_prompt
          },
          {
            role: "user",
            name: "job_descripton",
            content: description
          }
        ],
        response_format: zodResponseFormat(jobDescriptionValidationSchema, ZOD_RESPONSE_FORMAT_NAME)
      });
      const jobDescription: JobDescriptionSchema = JSON.parse(jdCompletion.choices[0].message.content!);

      if (isExistingCompanyName(folderPath, jobDescription.companyName)) {
        res.json({
          success: false,
          message: `You've already applied for jobs at ${jobDescription.companyName}.`,
          data: { id, tabId, status: JobStatus.WARNING }
        });
        return;
      }

      if (isFilterSecurityClearance && jobDescription.isSecurityClearanceRequired) {
        res.json({
          success: false,
          message: `The job at ${jobDescription.companyName} requires security clearance.`,
          data: { id, tabId, status: JobStatus.WARNING }
        });
        return;
      }

      if (isFilterRemote && !jobDescription.isRemote) {
        res.json({
          success: false,
          message: `The job at ${jobDescription.companyName} is not 100% remote.`,
          data: { id, tabId, status: JobStatus.WARNING }
        });
        return;
      }

      const resumeCompletion = await openAI.beta.chat.completions.parse({
        model: OPENAI_MODEL_NAME,
        temperature: OPENAI_TEMPERATURE,
        max_tokens: OPENAI_MAX_TOKENS,
        messages: [
          {
            role: "system",
            content: `${prompt.resume.sys_prompt} ${name} ${experience.join(",")}\n Job Description: ${description}`
          },
          ...userMessages
        ],
        response_format: zodResponseFormat(resumeValidationSchema, ZOD_RESPONSE_FORMAT_NAME)
      });

      const resume: ResumeSchema = JSON.parse(resumeCompletion.choices[0].message.content!);

      // Generate Cover Letter
      const coverLetterCompletion = await openAI.beta.chat.completions.parse({
        model: OPENAI_MODEL_NAME,
        temperature: OPENAI_TEMPERATURE,
        max_tokens: OPENAI_MAX_TOKENS,
        messages: [
          {
            role: "system",
            content: prompt.cover_letter.sys_prompt
          },
          ...coverLetterUserPrmpts
        ],
        response_format: zodResponseFormat(coverLetterValidationSchema, ZOD_RESPONSE_FORMAT_NAME)
      })

      const coverLetter: CoverLetterSchema = JSON.parse(coverLetterCompletion.choices[0].message.content!);

      const date = new Date();
      const currentDate = (date.getMonth() + 1) + "." + date.getDate();

      await exportResume(jobDescription, resume, name, template, folderPath + `/${currentDate}`, isConvertPDF, isOpenResume);
      await exportJobDescription(jobDescription, description, folderPath + `/${currentDate}`);
      await exportCoverLetter(coverLetter, name, jobDescription, folderPath + `/${currentDate}`);
      await createJiracodersApplication(jobDescription.companyName, jobDescription.roleTitle);

      res.json({
        success: true,
        data: {
          id,
          tabId,
          companyName: jobDescription.companyName,
          status: JobStatus.COMPLETED
        }
      });
    } catch (error) {
      console.error(error);

      if (String(error).includes("Error: 401 Incorrect API key provided")) {
        res.status(500).json({
          success: false,
          message: "Incorrect OpenAI API key provided.",
          data: { id, tabId, status: JobStatus.FAILED }
        });
      }

      if (String(error).includes("TemplateError: Multi error")) {
        res.status(500).json({
          success: false,
          message: "There is an error with the template docx.",
          data: { id, tabId, status: JobStatus.FAILED }
        });
      }

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Internal Server Error occurred.",
          data: { id, tabId, status: JobStatus.FAILED }
        });
      }
    }
  }
}
