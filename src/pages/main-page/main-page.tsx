import { useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress, Skeleton } from "@mui/material";
import { AppContext } from "../../shared/context/app-context";
import { GeneralMap } from "../../feature";
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
      <div
        style={{
          minHeight: "65vh",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          padding: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#74736E" }}>
          <CircularProgress size={18} />
          Загружаем карту и данные...
        </div>
        <Skeleton variant="rounded" width="100%" height={64} />
        <Skeleton variant="rounded" width="100%" height={320} />
        <Skeleton variant="rounded" width="80%" height={48} />
      </div>
    );
  }
  if (!authUserId) return null;

  return <GeneralMap />;
};
