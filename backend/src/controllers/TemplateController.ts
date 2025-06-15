import * as fs from "fs";
import * as path from "path";
import type { Request, Response } from "express";

export default class TemplateController {
  static async getFileList(req: Request, res: Response) {
    try {
      const fileNameList: string[] = fs.readdirSync(path.join(process.cwd(), "templates"));
      res.json({
        success: true,
        data: fileNameList
      });
    } catch (error) {
      res.json({
        success: false,
        error
      });
    }
  }
}
