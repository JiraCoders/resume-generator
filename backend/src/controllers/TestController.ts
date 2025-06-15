import * as fs from "fs";
import * as path from "path";
import type { Request, Response } from "express";

export default class TestController {
  static async downloadResume(req: Request, res: Response) {
    const filePath = path.join("E:", "resume", "custom", "Apollo.io_Dustin_Lee_Resume.docx");

    try {
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        res.json({
          success: false,
          message: "File not found"
        });
      }

      // Set headers for the file download
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
      res.setHeader("Content-Disposition", "attachment; filename=Dustin_Lee_Resume.docx");

      // Send the file
      res.sendFile(filePath);
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        message: "Failed to download resume"
      });
    }
  }
}
