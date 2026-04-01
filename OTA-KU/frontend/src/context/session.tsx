import { UserSchema } from "@/api/generated";
import { createContext } from "react";

export const SessionContext = createContext<UserSchema | null | undefined>(
  null,
);
