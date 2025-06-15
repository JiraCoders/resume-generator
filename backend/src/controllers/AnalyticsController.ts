import * as fs from "fs";
import * as path from "path";
import type { Request, Response } from "express";

export default class AnalyticsController {
  static async getAnalytics(req: Request, res: Response) {
    const folderPath = req.query.folderPath as string;

    try {
      const resolvedPath = path.resolve(folderPath);
      const items = await fs.promises.readdir(resolvedPath, { withFileTypes: true });

      const folderCounts: Record<string, number> = {};

      // Generate last 30 days with format YYYY.MM.DD
      const today = new Date();
      const validDates = new Set<string>();

      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const formatted = d.toISOString().slice(0, 10).replace(/-/g, ".");
        folderCounts[formatted] = 0;
        validDates.add(formatted);
      }

      for (const item of items) {
        if (item.isDirectory()) {
          const match = item.name.match(/^.+__(\d{4}_\d{2}_\d{2})$/);
          if (match) {
            const dateStr = match[1];
            const formattedDate = dateStr.replace(/_/g, ".");
            if (validDates.has(formattedDate)) {
              folderCounts[formattedDate]++;
            }
          }
        }
      }

      res.json({
        success: true,
        data: folderCounts
      });
    } catch (error) {
      res.json({
        success: false,
        error: error instanceof Error ? error.message : error
      });
    }
  }
}
