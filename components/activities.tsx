import HeatMap from "@/components/heat-map";
import { auth } from "@/lib/auth";
import Years from "@/components/years";
import Stats from "@/components/stats";
import LongestRunStats from "./longest-run-stats";
import { StravaActivity } from "@/lib/strava";

// Create a cache map to store the fetched activities
const cache = new Map();

const cachableYear = (year: number) => {
  return year !== new Date().getFullYear();
};

async function getActivities({
  accessToken,
  year,
}: {
  accessToken: string;
  year: number;
}) {
  // Check if we have a cached version of the activities
  if (cachableYear(year) && cache.has(year)) {
    console.log("Cache hit for year", year);
    return cache.get(year);
  }

  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);
  const afterTimestamp = Math.floor(startDate.getTime() / 1000);
  const beforeTimestamp = Math.floor(endDate.getTime() / 1000);

  let allActivities: StravaActivity[] = [];
  let page = 1;
  const perPage = 200;

  try {
    while (true) {
      const url = `https://www.strava.com/api/v3/activities?after=${afterTimestamp}&before=${beforeTimestamp}&per_page=${perPage}&page=${page}`;
      const response = await fetch(url, {
        cache: cachableYear(year) ? "force-cache" : "no-cache",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      allActivities = allActivities.concat(data);

      console.log("Fetched Page", year, page, data.length);

      if (data.length < perPage) {
        if (cachableYear(year) && !cache.has(year)) {
          console.log("Setting cache for year", year);
          cache.set(year, allActivities);
        }

        break; // Exit the loop if we've fetched all available activities
      }

      page++;
    }
  } catch (error) {
    console.error("Error fetching activities:", error);
    if (error instanceof Error) throw new Error(error.message);
  }

  return allActivities;
}

function getSummaryFromActivities(activities: StravaActivity[]) {
  let totalActivities = activities.length;
  let totalDistance = 0;
  let monthlyDistances: Record<number | string, number> = {};

  let longestRun = activities[0];

  activities.forEach((activity) => {
    // Sum up the total distance
    totalDistance += activity.distance / 1000; // Convert meters to kilometers

    const month = new Date(activity.start_date).getMonth() + 1;

    monthlyDistances[month] =
      (monthlyDistances[month] || 0) + activity.distance / 1000;

    // Check for longest run
    if (activity.distance > longestRun.distance) {
      longestRun = activity;
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
    longestRun,
  };
}

export default async function Activites({ year }: { year: number }) {
  const session = await auth();

  const accessToken = session!.accessToken;
  const activities = await getActivities({ accessToken, year });
  const summary = getSummaryFromActivities(activities);
  const longestRun = summary.longestRun;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Years selectedYear={year} />
      </div>
      <HeatMap activities={activities} year={year} />
      <Stats activities={activities} />
      <LongestRunStats activity={longestRun} />
    </div>
  );
}
