import { Route } from "@/lib/enums";
import type { RouteConfig } from "@/lib/types";
import HomePage from "@/pages/HomePage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import React from "react";


const routes: RouteConfig[] = [
  {
    routeName: Route.HOME,
    element: <HomePage />
  },
  {
    routeName: Route.ANALYTICS,
    element: <AnalyticsPage />
  },
  {
    routeName: Route.SETTINGS,
    element: <SettingsPage />
  }
];

export default routes;
