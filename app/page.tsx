import Activites from "@/components/activities";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/lib/auth";

export default async function Page({
  searchParams,
}: {
  searchParams?: {
    year?: string;
  };
}) {
  const session = await auth();
  const year = searchParams?.year || new Date().getFullYear();
  const yearAsNumber = Number(year);

  return (
    <div className="flex flex-col flex-1 mt-20 mx-4">
      {session?.user ? (
        <div>
          <Activites year={yearAsNumber} />
        </div>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("strava");
          }}
        >
          <Button type="submit">Sign in using Strava</Button>
        </form>
      )}
    </div>
  );
}
