"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { cn } from "@/lib/utils";

interface StravaActivity {
  start_date: string;
  distance: number;
}

export default function HeatMap({
  activities,
  year: selectedYear,
}: {
  activities: StravaActivity[];
  year: number;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const processedData = activities.map((activity) => {
    return {
      date: activity.start_date.substring(0, 10),
      count: activity.distance,
    };
  });

  const years = [2019, 2020, 2021, 2022, 2023, 2024];

  const handleChangeYear = (year: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("year", String(year));
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {years.map((year) => (
          <button
            key={year}
            onClick={() => handleChangeYear(year)}
            className={cn(
              "rounded-full px-4 py-2",
              year === selectedYear
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-800"
            )}
          >
            {year}
          </button>
        ))}
      </div>
      <CalendarHeatmap
        startDate={new Date(selectedYear, 0, 1)}
        endDate={new Date(selectedYear, 11, 31)}
        values={processedData}
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
