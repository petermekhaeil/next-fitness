import HeatMap from "@/components/heat-map";
import { auth } from "@/lib/auth";

interface StravaActivity {
  start_date: string;
  distance: number;
}

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
  const perPage = 100;

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
  }

  return allActivities;
}

export default async function Activites({ year }: { year: number }) {
  const session = await auth();

  const accessToken = session!.accessToken;
  const activities = await getActivities({ accessToken, year });

  return <HeatMap activities={activities} year={year} />;
}
