import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { StravaActivity } from "@/lib/strava";
import Splits from "./splits";

async function getActivity({
  accessToken,
  id,
}: {
  accessToken: string;
  id: number;
}) {
  const url = `https://www.strava.com/api/v3/activities/${id}`;
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

  return data as StravaActivity;
}

export default async function LongestRunStats({
  activity,
}: {
  activity: StravaActivity;
}) {
  const session = await auth();

  const accessToken = session!.accessToken;
  const longestRunStats = await getActivity({ accessToken, id: activity.id });

  const distance = (activity.distance / 1000).toFixed(1);
  const date =
    new Date(activity.start_date).toLocaleString("default", {
      month: "long",
    }) +
    " " +
    new Date(activity.start_date).getDate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Longest Run</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{distance} km</div>
        <p className="text-xs text-muted-foreground">
          <a
            className="font-medium underline underline-offset-4"
            href={`https://www.strava.com/activities/${activity.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {activity.name}
          </a>{" "}
          on {date}
        </p>
        <div className="mt-4 h-[120px]">
          <Splits activity={longestRunStats} />
        </div>
      </CardContent>
    </Card>
  );
}
