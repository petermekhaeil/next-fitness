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
    const activities: StravaActivity[] = await fetch(
      "https://www.strava.com/api/v3/activities",
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    ).then((res) => res.json());

    return (
      <div>
        <HeatMap activities={activities} />
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
