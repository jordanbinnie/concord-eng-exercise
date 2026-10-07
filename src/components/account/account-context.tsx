import { createContext, useContext } from "react";
import type { Account } from "@/types/account";

type AccountContextValue = {
  account: Account;
};

export const AccountContext = createContext<AccountContextValue | null>(null);

export function useAccount() {
  return useContext(AccountContext)?.account;
}
