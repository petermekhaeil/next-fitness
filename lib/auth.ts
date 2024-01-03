import NextAuth from "next-auth";
import StravaProvider from "next-auth/providers/strava";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
    }),
  ],
});
