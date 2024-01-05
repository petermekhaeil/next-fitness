"use client";

import { useEffect, useState } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

interface StravaActivity {
  start_date: string;
  distance: number;
}

interface ActivityData {
  date: string;
  count: number;
}

export default function Page({ activities }: { activities: StravaActivity[] }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  const years = [
    ...new Set(activities.map((a) => new Date(a.start_date).getFullYear())),
  ];

  return (
    <div>
      <div>
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
