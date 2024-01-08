import NextAuth from "next-auth";
import StravaProvider from "next-auth/providers/strava";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken: string;
    error?: "RefreshAccessTokenError";
  }
}

declare module "@auth/core/jwt" {
  interface JWT extends Record<string, unknown> {
    id: string;
    accessToken: string;
    accessTokenExpires: number;
    refreshToken?: string | undefined;
    error?: "RefreshAccessTokenError";
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    StravaProvider({
      clientId: process.env.STRAVA_CLIENT_ID,
      clientSecret: process.env.STRAVA_CLIENT_SECRET,
      authorization: {
        url: "https://www.strava.com/api/v3/oauth/authorize",
        params: {
          scope: "activity:read_all",
          approval_prompt: "auto",
          response_type: "code",
        },
      },
      profile(profile) {
        return {
          id: profile.id,
          name: `${profile.firstname} ${profile.lastname}`,
          email: null,
          image: profile.profile,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.id;
      session.accessToken = token.accessToken;
      session.error = token.error;

      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        return {
          id: user.id,
          accessToken: account.access_token as string,
          accessTokenExpires: Date.now() + account.expires_in! * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      try {
        const url =
          "https://www.strava.com/oauth/token?" +
          new URLSearchParams({
            client_id: process.env.STRAVA_CLIENT_ID || "",
            client_secret: process.env.STRAVA_CLIENT_SECRET || "",
            grant_type: "refresh_token",
            refresh_token: token.refreshToken || "",
          });

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        });

        const refreshedTokens = (await response.json()) as {
          access_token: string;
          expires_in: number;
          refresh_token: string;
        };

        if (!response.ok) {
          throw refreshedTokens;
        }

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        };
      } catch (error) {
        console.log(error);

        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
  },
});
