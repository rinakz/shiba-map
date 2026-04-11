import React, {
  useEffect,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";
import type { ShibaType, ShibaUser } from "../types";
import { supabase } from "../api/supabase-сlient";
import { syncPublicUserFromAuthMetadata } from "../api/sync-public-user-from-auth";

type AppContextType = {
  authUserId: string | null;
  isAuthLoading: boolean;
  user?: Partial<ShibaUser>;
  setUser: Dispatch<SetStateAction<Partial<ShibaUser> | undefined>>;
  mySiba?: ShibaType;
  setMySiba: Dispatch<SetStateAction<ShibaType | undefined>>;
  sibaIns: ShibaType[];
  setSibaIns: Dispatch<SetStateAction<ShibaType[]>>;
};

const AppContext = React.createContext<AppContextType>({
  authUserId: null,
  isAuthLoading: true,
  user: undefined,
  setUser: () => undefined,
  mySiba: undefined,
  setMySiba: () => undefined,
  sibaIns: [],
  setSibaIns: () => undefined,
});

function AppProvider({ children }: PropsWithChildren) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [user, setUser] = useState<Partial<ShibaUser>>();
  const [mySiba, setMySiba] = useState<ShibaType>();
  const [sibaIns, setSibaIns] = useState<ShibaType[]>([]);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setAuthUserId(data.session?.user?.id ?? null);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsAuthLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthUserId(session?.user?.id ?? null);
        if (
          session?.user &&
          (event === "INITIAL_SESSION" ||
            event === "SIGNED_IN" ||
            event === "USER_UPDATED")
        ) {
          void syncPublicUserFromAuthMetadata();
        }
      },
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        authUserId,
        isAuthLoading,
        user,
        setUser,
        mySiba,
        setMySiba,
        sibaIns,
        setSibaIns,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppProvider, AppContext };
