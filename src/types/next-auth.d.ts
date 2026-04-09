import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      roles: Role[];
      login: string | null;
      mustSetEmailOnLogin: boolean;
      mustChangePassword: boolean;
    };
  }

  interface User {
    roles: Role[];
    login: string | null;
    mustSetEmailOnLogin: boolean;
    mustChangePassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: Role[];
    login: string | null;
    mustSetEmailOnLogin: boolean;
    mustChangePassword: boolean;
  }
}
