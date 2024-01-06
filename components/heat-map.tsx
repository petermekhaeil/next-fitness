"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CalendarHeatmap from "react-calendar-heatmap";

interface StravaActivity {
  start_date: string;
  distance: number;
}

interface ActivityData {
  date: string;
  count: number;
}

export default function HeatMap({
  activities,
}: {
  activities: StravaActivity[];
}) {
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year")) || new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(year);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);

  useEffect(() => {
    const filteredActivities = activities.filter(
      (activity) => new Date(activity.start_date).getFullYear() === selectedYear
    );

    const processedData = filteredActivities.map((activity) => {
      return {
        date: activity.start_date.substring(0, 10),
        count: activity.distance,
      };
    });

    setActivityData(processedData);
  }, [activities, selectedYear]);

  const years = [2019, 2020, 2021, 2022, 2023, 2024];

  return (
    <div>
      <div className="flex gap-4">
        {years.map((year) => (
          <button key={year} onClick={() => setSelectedYear(year)}>
            {year}
          </button>
        ))}
      </div>
      <CalendarHeatmap
        startDate={new Date(selectedYear, 0, 1)}
        endDate={new Date(selectedYear, 11, 31)}
        values={activityData}
        classForValue={(value) => {
          if (!value || value.count === 0) {
            return "fill-gray-100";
          }
          if (value.count <= 1000) {
            return "fill-orange-200";
          } else if (value.count <= 5000) {
            return "fill-orange-400";
          } else {
            return "fill-orange-600";
          }
        }}
        showWeekdayLabels={true}
      />
    </div>
  );
}
