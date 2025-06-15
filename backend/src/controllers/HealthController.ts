import type { Request, Response } from "express";

export default class HealthController {
  static async healthCheck(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      message: "The server is up and running!"
    });
  }
}
