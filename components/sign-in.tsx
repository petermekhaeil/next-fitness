"use server";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth";

export default async function SignIn() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("strava");
      }}
    >
      <Button type="submit">Sign in using Strava</Button>
    </form>
  );
}
