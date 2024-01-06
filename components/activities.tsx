import HeatMap from "@/components/heat-map";
import { auth } from "@/lib/auth";

interface StravaActivity {
  start_date: string;
  distance: number;
}

async function getActivities({
  accessToken,
  year,
}: {
  accessToken: string;
  year: number;
}) {
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
        cache: "force-cache",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      allActivities = allActivities.concat(data);

      console.log("page", year, page, data.length);
      if (data.length < perPage) {
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

  return (
    <div>
      <HeatMap activities={activities} year={year} />
    </div>
  );
}
