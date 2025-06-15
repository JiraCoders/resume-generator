import Navbar from "@/layouts/Navbar";
import { Route } from "@/lib/enums";
import type { RouteConfig } from "@/lib/types";
import routes from "@/routes";
import { MantineProvider } from "@mantine/core";
import React from "react";

import useStore from "./store/zustand";

import "@mantine/core/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/charts/styles.css";
import "@/styles/globals.css";

function IndexSidePanel() {
  const [pageRoute, setPageRoute] = React.useState<Route>(Route.HOME);
  const { jobStatuses } = useStore();
  const pageRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (pageRef.current) {
      requestAnimationFrame(() => {
        pageRef.current.scrollTop = pageRef.current.scrollHeight;
      });
    }
  }, [jobStatuses]);

  const navigate = (routeName: Route) => {
    setPageRoute(routeName);
  };

  return (
    <MantineProvider>
      <div className="flex flex-col w-full h-screen max-h-screen overflow-y-auto px-4" ref={pageRef}>
        <Navbar currentRoute={pageRoute} navigate={navigate} />
        {routes.find((route: RouteConfig) => route.routeName === pageRoute).element}
      </div>
    </MantineProvider>
  );
}

export default IndexSidePanel;
