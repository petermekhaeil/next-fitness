import HeatMap from "@/components/heat-map";
import LoginForm from "@/components/login-form";
import { auth, signOut } from "@/lib/auth";

interface StravaActivity {
  start_date: string;
  distance: number;
}

export default async function Page() {
  const session = await auth();

  if (session?.user) {
    const year = 2023;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    const afterTimestamp = Math.floor(startDate.getTime() / 1000);
    const beforeTimestamp = Math.floor(endDate.getTime() / 1000);

    let allActivities: StravaActivity[] = [];
    let page = 1;
    const perPage = 30; // Max number of activities per request

    try {
      while (true) {
        const url = `https://www.strava.com/api/v3/activities?after=${afterTimestamp}&before=${beforeTimestamp}&per_page=${perPage}&page=${page}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Error fetching activities");
        }

        allActivities = allActivities.concat(data);

        if (data.length < perPage) {
          break; // Exit the loop if we've fetched all available activities
        }

        page++;
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      return; // Optionally handle the error further
    }

    return (
      <div>
        <HeatMap activities={allActivities} />
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button type="submit">Sign out</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
