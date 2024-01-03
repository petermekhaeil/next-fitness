import { signIn } from "@/lib/auth";

export default function LoginForm() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("strava");
      }}
    >
      <button type="submit">Sign in using Strava</button>
    </form>
  );
}
