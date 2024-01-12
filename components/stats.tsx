"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
} from "recharts";

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

function getSummaryFromActivities(activities: StravaActivity[]) {
  let totalActivities = activities.length;
  let totalDistance = 0;
  let monthlyDistances: Record<number | string, number> = {};
  let longestRun = { id: 0, name: "", distance: 0, date: "" };

  activities.forEach((activity) => {
    // Sum up the total distance
    totalDistance += activity.distance / 1000; // Convert meters to kilometers

    const month = new Date(activity.start_date).getMonth() + 1;

    monthlyDistances[month] =
      (monthlyDistances[month] || 0) + activity.distance / 1000;

    // Check for longest run
    if (activity.distance > longestRun.distance) {
      longestRun = {
        id: activity.id,
        name: activity.name,
        distance: activity.distance,
        date: activity.start_date,
      };
    }
  });

  const bestMonth = Object.keys(monthlyDistances).reduce((a, b) =>
    monthlyDistances[a] > monthlyDistances[b] ? a : b
  );

  const bestMonthName = new Date(
    new Date().getFullYear(),
    Number(bestMonth) - 1,
    1
  ).toLocaleString("default", { month: "long" });

  return {
    totalActivities,
    totalDistance: totalDistance.toFixed(1),
    bestMonth: Number(bestMonth),
    bestMonthName,
    bestMonthDistance: monthlyDistances[bestMonth].toFixed(1),
    longestRun: {
      id: longestRun.id,
      name: longestRun.name,
      distance: (longestRun.distance / 1000).toFixed(1),
      date:
        new Date(longestRun.date).toLocaleString("default", {
          month: "long",
        }) +
        " " +
        new Date(longestRun.date).getDate(),
    },
  };
}

function getCumulativeDistancePerMonth(activities: StravaActivity[]) {
  let monthlyDistances: Record<number, number> = {};

  activities.forEach((activity) => {
    let month = new Date(activity.start_date).getMonth(); // 0 indexed
    monthlyDistances[month] =
      (monthlyDistances[month] || 0) + activity.distance / 1000; // Convert meters to kilometers
  });

  let cumulativeDistance = 0;
  let cumulativeDistancesPerMonth = [];

  for (let month = 0; month < 12; month++) {
    cumulativeDistance += monthlyDistances[month] || 0;
    cumulativeDistancesPerMonth.push({
      month: month,
      distance: cumulativeDistance,
    });
  }

  return cumulativeDistancesPerMonth;
}

function getDistanceForEachMonth(activities: StravaActivity[]) {
  let monthlyDistances: Record<number, number> = {};

  activities.forEach((activity) => {
    let month = new Date(activity.start_date).getMonth(); // 0 indexed
    monthlyDistances[month] =
      (monthlyDistances[month] || 0) + activity.distance / 1000; // Convert meters to kilometers
  });

  let distancesPerMonth = [];

  for (let month = 0; month < 12; month++) {
    distancesPerMonth.push({
      month: new Date(new Date().getFullYear(), month, 1).toLocaleString(
        "default",
        { month: "short" }
      ),
      distance: monthlyDistances[month] || 0,
    });
  }

  return distancesPerMonth;
}

function getWeeklyDistances(activities: StravaActivity[]) {
  let totalDistance = 0;
  let dailyDistances: Record<string, number> = {};

  // Sum distances for each day of the week
  activities.forEach((activity) => {
    let dayOfWeek = new Date(activity.start_date).toLocaleString("en-US", {
      weekday: "long",
    });
    dailyDistances[dayOfWeek] = dailyDistances[dayOfWeek] || 0;
    dailyDistances[dayOfWeek] += activity.distance / 1000;
    totalDistance += activity.distance / 1000;
  });

  // Calculate percentages and prepare the result array
  let result = Object.keys(dailyDistances).map((day) => {
    let percentage =
      totalDistance > 0 ? (dailyDistances[day] / totalDistance) * 100 : 0;
    return {
      day: day,
      distance: dailyDistances[day],
      percentage: percentage,
    };
  });

  return result;
}

export default function Stats({
  activities,
}: {
  activities: StravaActivity[];
}) {
  const summary = getSummaryFromActivities(activities);
  const cumulativeDistancePerMonth = getCumulativeDistancePerMonth(activities);
  const distanceByMonth = getDistanceForEachMonth(activities);
  const weeklyPercentage = getWeeklyDistances(activities);
  const bestWeekday = weeklyPercentage.reduce((a, b) =>
    Number(a.percentage) > Number(b.percentage) ? a : b
  );

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalDistance} km</div>
          <p className="text-xs text-muted-foreground">
            {summary.totalActivities} activities
          </p>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cumulativeDistancePerMonth}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <Line
                  type="monotone"
                  strokeWidth={2}
                  dataKey="distance"
                  activeDot={{
                    r: 6,
                    style: { fill: "hsl(var(--primary))", opacity: 0.25 },
                  }}
                  style={{
                    stroke: "hsl(var(--primary))",
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const month = new Date(
                        new Date().getFullYear(),
                        payload[0].payload.month,
                        1
                      ).toLocaleString("default", { month: "short" });
                      const distance = payload[0].payload.distance.toFixed(1);

                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Month
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {month}
                              </span>
                            </div>
                            <div className="flex flex-col col-span-2">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Cumulative Distance
                              </span>
                              <span className="font-bold">{distance} km</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.bestMonthName}</div>
          <p className="text-xs text-muted-foreground">
            Total distance of {summary.bestMonthDistance} km
          </p>
          <div className="mt-4 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distanceByMonth}>
                <Bar
                  dataKey="distance"
                  style={{
                    fill: "hsl(var(--primary))",
                    opacity: 1,
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const month = payload[0].payload.month;
                      const distance = payload[0].payload.distance.toFixed(1);

                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-3 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Month
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {month}
                              </span>
                            </div>
                            <div className="flex flex-col col-span-2">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Distance
                              </span>
                              <span className="font-bold">{distance} km</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Weekday</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bestWeekday.day}</div>
          <p className="text-xs text-muted-foreground">
            Total distance of {bestWeekday.distance.toFixed(2)} km
          </p>
          <div className="mt-4 h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weeklyPercentage}
                  dataKey="percentage"
                  cx="50%"
                  cy="50%"
                  style={{
                    fill: "hsl(var(--primary))",
                    opacity: 1,
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const day = payload[0].payload.day;
                      const distance = payload[0].payload.distance.toFixed(1);

                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col col-span-2">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Day
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {day}
                              </span>
                            </div>
                            <div className="flex flex-col col-span-2">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Distance
                              </span>
                              <span className="font-bold">{distance} km</span>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
