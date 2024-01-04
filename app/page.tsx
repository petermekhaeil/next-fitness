import LoginForm from "@/components/login-form";
import { auth, signOut } from "@/lib/auth";
import type { Session } from "next-auth";

export default async function Page() {
  const session = await auth();
  return (
    <div className="space-y-2">
      <SessionData session={session} />
    </div>
  );
}

function SessionData({ session }: { session: Session | null }) {
  if (session?.user) {
    const activities = fetch("https://www.strava.com/api/v3/activities", {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }).then((res) => res.json());

    return (
      <div className="w-full space-y-2 overflow-auto">
        <h2 className="text-xl font-bold">Current Session Data</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
        <pre>{JSON.stringify(activities, null, 2)}</pre>
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
