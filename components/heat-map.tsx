"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "next-auth";

interface StravaActivity {
  start_date: string;
  distance: number;
}

export default function HeatMap({
  activities,
  year: selectedYear,
  athlete,
}: {
  activities: StravaActivity[];
  year: number;
  athlete: User & { id: string };
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

  const years = [...Array(4).keys()].map((i) => new Date().getFullYear() - i);

  const handleChangeYear = (year: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("year", String(year));
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Tabs
          defaultValue={selectedYear + ""}
          className="flex justify-center w-full"
          onValueChange={(value) => handleChangeYear(Number(value))}
        >
          <TabsList>
            {years.map((year) => (
              <TabsTrigger key={year} value={year + ""}>
                {year}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Activities</CardTitle>
          <CardDescription>
            {processedData.length} activities in {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            onMouseOver={(event, value) => {
              console.log(value);
            }}
          />
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}
