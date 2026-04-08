import { useQuery } from "@tanstack/react-query";
import { getShibaRank } from "./shiba-academy.data";
import {
  fetchAllCommunities,
  fetchUserCommunity,
} from "../../shared/api/communities";
import {
  fetchFollowersList,
  fetchFollowingsList,
  fetchHealthAlert,
  fetchMySibaByUserId,
  fetchSibaAcademyProgress,
  fetchSubscribersCount,
  fetchSubscriptionsCount,
  fetchUserById,
  profileQueryKeys,
} from "./profile.utils";
import type { ShibaType } from "../../shared/types";

type UseProfilePageQueriesParams = {
  authUserId: string | null;
  mySiba?: ShibaType;
  peopleListMode: "followers" | "followings" | null;
};

export const useProfilePageQueries = ({
  authUserId,
  mySiba,
  peopleListMode,
}: UseProfilePageQueriesParams) => {
  const userQuery = useQuery({
    queryKey: authUserId ? profileQueryKeys.user(authUserId) : ["user", "guest"],
    queryFn: () => fetchUserById(authUserId as string),
    enabled: Boolean(authUserId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const mySibaQuery = useQuery({
    queryKey: authUserId ? profileQueryKeys.mySiba(authUserId) : ["mySiba", "guest"],
    queryFn: () => fetchMySibaByUserId(authUserId as string),
    enabled: Boolean(authUserId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const subscriptionsCountQuery = useQuery<number>({
    queryKey: ["user-friends-counts", "subscriptions", authUserId],
    enabled: Boolean(authUserId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: () => fetchSubscriptionsCount(authUserId as string),
  });

  const subscribersCountQuery = useQuery<number>({
    queryKey: ["user-friends-counts", "subscribers", authUserId],
    enabled: Boolean(authUserId),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: () => fetchSubscribersCount(authUserId as string),
  });

  const academyProgressQuery = useQuery<{ learned_skill_ids: string[] | null } | null>({
    queryKey: ["siba-academy", mySiba?.id ?? "none"],
    enabled: Boolean(mySiba?.id),
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: () => fetchSibaAcademyProgress(mySiba!.id),
  });

  const healthAlertQuery = useQuery({
    queryKey: ["health-alert", mySiba?.id],
    enabled: Boolean(mySiba?.id),
    queryFn: () => fetchHealthAlert(mySiba!.id),
  });

  const communityQuery = useQuery({
    queryKey: ["user-community", authUserId],
    enabled: Boolean(authUserId),
    queryFn: () => fetchUserCommunity(authUserId as string),
  });

  const communitiesQuery = useQuery({
    queryKey: ["communities", "all"],
    enabled: Boolean(authUserId),
    queryFn: fetchAllCommunities,
  });

  const followersListQuery = useQuery({
    queryKey: ["friends-list", "followers", authUserId],
    enabled: Boolean(peopleListMode === "followers" && authUserId),
    queryFn: () => fetchFollowersList(authUserId as string),
  });

  const followingsListQuery = useQuery({
    queryKey: ["friends-list", "followings", authUserId],
    enabled: Boolean(peopleListMode === "followings" && authUserId),
    queryFn: () => fetchFollowingsList(authUserId as string),
  });

  const completedCommandsCount = academyProgressQuery.data?.learned_skill_ids?.length ?? 0;
  const academyRank = getShibaRank(completedCommandsCount).rank;
  const peopleListItems =
    peopleListMode === "followers"
      ? (followersListQuery.data ?? [])
      : peopleListMode === "followings"
        ? (followingsListQuery.data ?? [])
        : [];
  const peopleListTitle =
    peopleListMode === "followers" ? "Подписчики" : "Подписки";
  const peopleListIsLoading =
    peopleListMode === "followers"
      ? followersListQuery.isLoading
      : peopleListMode === "followings"
        ? followingsListQuery.isLoading
        : false;

  const isProfileLoading =
    userQuery.isLoading ||
    mySibaQuery.isLoading ||
    subscriptionsCountQuery.isLoading ||
    subscribersCountQuery.isLoading;

  return {
    userQuery,
    mySibaQuery,
    subscriptionsCountQuery,
    subscribersCountQuery,
    academyProgressQuery,
    healthAlertQuery,
    communityQuery,
    communitiesQuery,
    followersListQuery,
    followingsListQuery,
    academyRank,
    peopleListItems,
    peopleListTitle,
    peopleListIsLoading,
    isProfileLoading,
  };
};
