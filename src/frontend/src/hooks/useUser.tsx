import { createContext, useContext } from "react";
import type { ReactNode } from "react";

interface UserContextValue {
  mobile: string | null;
}

export const UserContext = createContext<UserContextValue>({ mobile: null });

export function UserProvider({
  mobile,
  children,
}: {
  mobile: string | null;
  children: ReactNode;
}) {
  return (
    <UserContext.Provider value={{ mobile }}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
