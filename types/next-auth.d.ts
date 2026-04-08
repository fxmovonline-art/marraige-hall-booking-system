import type { DefaultSession } from "next-auth";

import "next-auth";
import "next-auth/jwt";

type UserRole = "CUSTOMER" | "OWNER" | "ADMIN";

declare module "next-auth" {
  interface User {
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
  }
}
