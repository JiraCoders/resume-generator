import type { APIResponse, BarChartData } from "@/lib/types";
import NetworkError from "@/pages/NetworkError";
import { getFolderPath } from "@/store";
import { BarChart } from "@mantine/charts";
import { LoadingOverlay, Text } from "@mantine/core";
import React from "react";

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isNetworkError, setIsNetworkError] = React.useState<boolean>(false);
  const [barChartData, setBarChartData] = React.useState<BarChartData[]>([]);

  React.useEffect(() => {
    const fetchFileList = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${process.env.PLASMO_PUBLIC_BASE_URL}/analytics?folderPath=${getFolderPath()}`);
        const data: APIResponse = await response.json();
        const formattedData = Object.entries(data.data).map(([date, count]) => ({
          date,
          count: Number(count)
        }));

        setBarChartData(formattedData);
      } catch (error) {
        console.error(error);
        setIsNetworkError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileList();
  }, []);

  return !isNetworkError ? (
    <div className="flex flex-col flex-grow gap-3 py-3">
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ blur: 5 }} />

      <Text className="font-bold">{"Jobs Applied in Recent 30 days"}</Text>

      <BarChart
        className="pr-4"
        h={1000}
        data={barChartData}
        dataKey="date"
        orientation="vertical"
        yAxisProps={{ width: 80 }}
        barProps={{ radius: 10 }}
        series={[{ name: "count", label: "Applied Jobs", color: "blue.6" }]}
        withBarValueLabel
      />
    </div>
  ) : (
    <NetworkError />
  );
}
