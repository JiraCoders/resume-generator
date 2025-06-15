import AnalyticsController from "@/controllers/AnalyticsController";
import HealthController from "@/controllers/HealthController";
import ResumeController from "@/controllers/ResumeController";
import TemplateController from "@/controllers/TemplateController";
import TestController from "@/controllers/TestController";
import * as express from "express";

const routes: express.Router = express.Router();

routes.get("/health", HealthController.healthCheck);
routes.get("/templates", TemplateController.getFileList);
routes.get("/analytics", AnalyticsController.getAnalytics);
routes.post("/generate", ResumeController.tailorResume);

routes.get("/test", TestController.downloadResume);

export default routes;
