import Activites from "@/components/activities";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/lib/auth";

function getDefaultYear() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return currentMonth === 0 ? currentYear - 1 : currentYear;
}

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    year?: string;
  };
}) {
  const session = await auth();
  const year = searchParams?.year || getDefaultYear();
  const yearAsNumber = Number(year);

  return (
    <div className="flex flex-col min-h-screen">
      {session?.user ? (
        <div className="mx-auto max-w-4xl w-full py-4 sm:py-32 lg:py-36 px-4">
          <Activites year={yearAsNumber} />
        </div>
      ) : (
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Next Fitness
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Connect to Strava to see your activities in a calendar heatmap.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <form
                action={async () => {
                  "use server";
                  await signIn("strava");
                }}
              >
                <Button type="submit">Sign in using Strava</Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
