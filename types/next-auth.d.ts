import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    organizerSlug: string;
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      organizerSlug: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organizerSlug: string;
  }
}
