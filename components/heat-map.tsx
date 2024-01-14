"use client";

import CalendarHeatmap from "react-calendar-heatmap";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

interface StravaActivity {
  id: number;
  start_date: string;
  distance: number;
  elapsed_time: number;
  moving_time: number;
  average_speed: number;
  average_heartrate: number;
  type: string;
  name: string;
}

type HeatMapValue =
  | "distance"
  | "elapsed_time"
  | "moving_time"
  | "average_speed"
  | "average_heartrate";

interface HeatMapData {
  date: string;
  count: number;
}

const mapActivitiesToCount = (
  activities: StravaActivity[],
  value: HeatMapValue
) => {
  return activities.map((activity) => {
    return {
      date: activity.start_date.substring(0, 10),
      count:
        value === "distance"
          ? activity.distance
          : value === "elapsed_time"
          ? activity.elapsed_time
          : value === "moving_time"
          ? activity.moving_time
          : value === "average_speed"
          ? activity.average_speed
          : value === "average_heartrate"
          ? activity.average_heartrate
          : 0,
    };
  });
};

function classForValue(value: { count: number }, type: HeatMapValue) {
  if (!value || value.count === 0) {
    return "fill-gray-100";
  }

  switch (type) {
    case "distance":
      // Assuming distance is in meters
      if (value.count < 1000) return "fill-orange-100";
      if (value.count < 2000) return "fill-orange-200";
      if (value.count < 3000) return "fill-orange-300";
      if (value.count < 4000) return "fill-orange-400";
      return "fill-orange-500";

    case "elapsed_time":
    case "moving_time":
      // Assuming time is in seconds
      if (value.count < 1800) return "fill-orange-100"; // less than 30 minutes
      if (value.count < 3600) return "fill-orange-200"; // 30 mins to 1 hour
      if (value.count < 7200) return "fill-orange-300"; // 1 to 2 hours
      if (value.count < 14400) return "fill-orange-400"; // 2 to 4 hours
      return "fill-orange-500"; // more than 4 hours

    case "average_speed":
      // Assuming speed is in m/s
      if (value.count < 1.4) return "fill-orange-100"; // Walking
      if (value.count < 2.2) return "fill-orange-200"; // Jogging
      if (value.count < 3.5) return "fill-orange-300"; // Running
      if (value.count < 5.5) return "fill-orange-400"; // Fast Running
      return "fill-orange-500"; // Sprinting

    case "average_heartrate":
      if (value.count < 60) return "fill-orange-100"; // Resting
      if (value.count < 90) return "fill-orange-200"; // Light Activity
      if (value.count < 120) return "fill-orange-300"; // Moderate Exercise
      if (value.count < 150) return "fill-orange-400"; // Intense Exercise
      return "fill-orange-500"; // Max Effort

    default:
      return "fill-gray-300";
  }
}

export default function HeatMap({
  activities,
  year: selectedYear,
}: {
  activities: StravaActivity[];
  year: number;
}) {
  const [heatmapValue, setHeatmapValue] = useState<HeatMapValue>("distance");
  const [processedData, setProcessedData] = useState<HeatMapData[]>(
    mapActivitiesToCount(activities, heatmapValue)
  );

  useEffect(() => {
    setProcessedData(mapActivitiesToCount(activities, heatmapValue));
  }, [activities, heatmapValue]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities</CardTitle>
        <CardDescription>
          {processedData.length} activities in {selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <CalendarHeatmap
          startDate={new Date(selectedYear, 0, 1)}
          endDate={new Date(selectedYear, 11, 31)}
          values={processedData}
          classForValue={(value) => {
            return classForValue(value, heatmapValue);
          }}
          showWeekdayLabels={true}
          onMouseOver={(event, value) => {
            console.log(value);
          }}
        />
      </CardContent>
      <CardFooter className="flex justify-end">
        <div className="flex items-center">
          <span className="mr-1 text-sm text-muted-foreground">Less</span>
          <div className="w-2.5 h-2.5 bg-gray-100 mr-1"></div>
          <div className="w-2.5 h-2.5 bg-orange-200 mr-1"></div>
          <div className="w-2.5 h-2.5 bg-orange-300 mr-1"></div>
          <div className="w-2.5 h-2.5 bg-orange-400 mr-1"></div>
          <div className="w-2.5 h-2.5 bg-orange-500 mr-1"></div>
          <span className="text-sm text-muted-foreground">More</span>
        </div>
      </CardFooter>
    </Card>
  );
}
