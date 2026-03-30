import { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppContext } from "../../shared/context/app-context";
import { GeneralMap, Tour } from "../../feature";
import {
  fetchAllSibas,
  fetchMySibaByUserId,
  fetchUserById,
  profileQueryKeys,
} from "../profile-page/profile.utils";

export const MainPage = () => {
  const { authUserId, isAuthLoading, setUser, setSibaIns, setMySiba } =
    useContext(AppContext);

  const userQuery = useQuery({
    queryKey: authUserId ? profileQueryKeys.user(authUserId) : ["user", "guest"],
    queryFn: () => fetchUserById(authUserId as string),
    enabled: Boolean(authUserId),
  });

  const sibasQuery = useQuery({
    queryKey: profileQueryKeys.allSibas(),
    queryFn: fetchAllSibas,
    enabled: Boolean(authUserId),
  });

  const mySibaQuery = useQuery({
    queryKey: authUserId ? profileQueryKeys.mySiba(authUserId) : ["mySiba", "guest"],
    queryFn: () => fetchMySibaByUserId(authUserId as string),
    enabled: Boolean(authUserId),
  });

  useEffect(() => {
    if (userQuery.data) setUser(userQuery.data);
  }, [userQuery.data, setUser]);

  useEffect(() => {
    if (sibasQuery.data) setSibaIns(sibasQuery.data);
  }, [sibasQuery.data, setSibaIns]);

  useEffect(() => {
    if (mySibaQuery.data !== undefined) setMySiba(mySibaQuery.data);
  }, [mySibaQuery.data, setMySiba]);

  const isPageDataLoading =
    Boolean(authUserId) &&
    (userQuery.isLoading || sibasQuery.isLoading || mySibaQuery.isLoading);

  if (isAuthLoading || isPageDataLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#74736E" }}>
        Загружаем данные карты...
      </div>
    );
  }
  if (!authUserId) return <Tour />;

  return <GeneralMap />;
};
