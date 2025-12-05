import React, { useState } from "react";
import type { ShibaType } from "../../types";

const AppContext = React.createContext<any>(null);

function AppProvider(props: any) {
  const [user, setUser] = useState();
  const [mySiba, setMySiba] = useState<ShibaType>();
  const [sibaIns, setSibaIns] = useState<ShibaType[]>([]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        mySiba,
        setMySiba,
        sibaIns,
        setSibaIns,
      }}
      {...props}
    />
  );
}

export { AppProvider, AppContext };
