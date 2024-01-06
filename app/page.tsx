import Activites from "@/components/activities";
import { Button } from "@/components/ui/button";
import { auth, signIn } from "@/lib/auth";

export default async function Page() {
  const session = await auth();

  return (
    <div className="flex flex-col items-center flex-1 mt-20 mx-4">
      {session?.user ? (
        <div>
          <Activites />
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
