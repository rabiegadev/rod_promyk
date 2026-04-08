import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
      login: string | null;
      mustSetEmailOnLogin: boolean;
    };
  }

  interface User {
    role: Role;
    login: string | null;
    mustSetEmailOnLogin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    login: string | null;
    mustSetEmailOnLogin: boolean;
  }
}
