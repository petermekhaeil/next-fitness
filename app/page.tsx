import LoginForm from "@/components/login-form";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

export default async function Page() {
  const session = await auth();
  return (
    <div className="space-y-2">
      <SessionData session={session} />
    </div>
  );
}

export function SessionData({ session }: { session: Session | null }) {
  if (session?.user) {
    return (
      <div className="w-full space-y-2 overflow-auto">
        <h2 className="text-xl font-bold">Current Session Data</h2>
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div>
      <LoginForm />
    </div>
  );
}
