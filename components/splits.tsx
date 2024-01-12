"use client";

import { StravaActivity } from "@/lib/strava";
import { Bar, BarChart, ResponsiveContainer, Tooltip } from "recharts";

function getSplitsDataForChart(activity: StravaActivity) {
  if (!activity || !activity.splits_metric) {
    return [];
  }

  const splits = activity.splits_metric;

  const chartData = splits.map((split) => {
    // Convert average speed from m/s to km/h
    const speedKmH = split.average_speed * 3.6;

    // Calculate pace in min/km
    const paceMinKm = 60 / speedKmH;

    return {
      splitNumber: split.split,
      pace: paceMinKm,
    };
  });

  return chartData;
}

export default function Splits({ activity }: { activity: StravaActivity }) {
  const splits = getSplitsDataForChart(activity);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={splits}>
        <Bar
          dataKey="pace"
          style={{
            fill: "hsl(var(--primary))",
          }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const split = payload[0].payload.splitNumber;
              const pace = payload[0].payload.pace.toFixed(2);
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Split
                      </span>
                      <span className="font-bold text-muted-foreground">
                        {split}
                      </span>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                        Pace
                      </span>
                      <span className="font-bold">{pace} /km</span>
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
  );
}
