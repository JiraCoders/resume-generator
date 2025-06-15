import type { AlertColor, ChromeRuntimeMessage, JobStatus, Route } from "@/lib/enums";

export interface RouteConfig {
  routeName: Route;
  element: JSX.Element;
}

export interface AlertConfig {
  color: AlertColor;
  title?: string;
  message: string;
}

export interface APIResponse {
  success: boolean;
  // eslint-disable-next-line
  data: any;
  status: JobStatus;
  message?: string;
  // eslint-disable-next-line
  error?: any;
}

export interface ChromeMessageEvent {
  type: ChromeRuntimeMessage;
  payload: string;
}

export interface BarChartData {
  date: string;
  count: number;
}
