import { useContext, useMemo, useState } from "react";
import { useMediaQuery } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  assignUserToCommunity,
  fetchAllCommunities,
  fetchCommunityMemberships,
} from "../../shared/api/communities";
import { AppContext } from "../../shared/context/app-context";
import { MainTabBar } from "../../shared/ui";
import {
  fetchAllSibas,
  fetchSibaKennelLinks,
} from "../profile-page/profile.utils";
import { PATH } from "../../shared/constants/path";
import { LeaderboardChatList } from "./leaderboard-chat-list";
import { LeaderboardErrorBanner } from "./leaderboard-error-banner";
import { LeaderboardHeader } from "./leaderboard-header";
import { LeaderboardInlineTabs } from "./leaderboard-inline-tabs";
import { LeaderboardListSkeleton } from "./leaderboard-list-skeleton";
import { LeaderboardMyPlaceBar } from "./leaderboard-my-place-bar";
import { LeaderboardSibaList } from "./leaderboard-siba-list";
import { LeaderboardSibaSheet } from "./leaderboard-siba-sheet";
import {
  LEADERBOARD_BREEDERS_EMPTY_HINT,
  LEADERBOARD_EMPTY_WORLD_HINT,
  LEADERBOARD_MEDIA_MOBILE,
  LEADERBOARD_QUERY_KEYS,
} from "./leaderboard-page.constants";
import type { LeaderboardTab } from "./leaderboard-page.types";
import {
  findMyCommunityPlace,
  findUserCommunityId,
  isLeaderboardListLoading,
} from "./leaderboard-page.ui";
import {
  buildBreederLeaderboard,
  buildChatLeaderboard,
  buildWorldLeaderboard,
} from "./leaderboard-page.utils";
import stls from "./leaderboard-page.module.sass";

export const LeaderboardPage = () => {
  const { authUserId, user } = useContext(AppContext);
  const isBreederAccount = user?.account_type === "breeder";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(LEADERBOARD_MEDIA_MOBILE);
  const [tab, setTab] = useState<LeaderboardTab>("world");
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [assigningCommunityId, setAssigningCommunityId] = useState<
    string | null
  >(null);

  const sibasQuery = useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.sibas,
    queryFn: fetchAllSibas,
    enabled: Boolean(authUserId),
  });

  const kennelLinksQuery = useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.kennelLinks,
    queryFn: fetchSibaKennelLinks,
    enabled: Boolean(authUserId),
  });

  const communitiesQuery = useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.communities,
    enabled: Boolean(authUserId),
    queryFn: fetchAllCommunities,
  });
  const membershipsQuery = useQuery({
    queryKey: LEADERBOARD_QUERY_KEYS.memberships,
    enabled: Boolean(authUserId),
    queryFn: fetchCommunityMemberships,
  });

  const worldLeaderboard = useMemo(
    () => buildWorldLeaderboard(sibasQuery.data ?? []),
    [sibasQuery.data],
  );

  const breederLeaderboard = useMemo(
    () =>
      buildBreederLeaderboard(
        sibasQuery.data ?? [],
        kennelLinksQuery.data ?? [],
      ),
    [sibasQuery.data, kennelLinksQuery.data],
  );

  const myWorldPlace = useMemo(
    () =>
      worldLeaderboard.find((item) => item.siba_user_id === authUserId) ?? null,
    [authUserId, worldLeaderboard],
  );

  const myBreederPlace = useMemo(
    () =>
      breederLeaderboard.find((item) => item.siba_user_id === authUserId) ??
      null,
    [authUserId, breederLeaderboard],
  );

  const chatLeaderboard = useMemo(
    () =>
      buildChatLeaderboard(
        communitiesQuery.data ?? [],
        membershipsQuery.data ?? [],
        sibasQuery.data ?? [],
      ),
    [communitiesQuery.data, membershipsQuery.data, sibasQuery.data],
  );

  const myCommunityId = useMemo(
    () =>
      findUserCommunityId(membershipsQuery.data ?? [], authUserId),
    [authUserId, membershipsQuery],
  );

  const myCommunity = useMemo(
    () => findMyCommunityPlace(chatLeaderboard, myCommunityId),
    [chatLeaderboard, myCommunityId],
  );

  const listLoading = isLeaderboardListLoading(tab, {
    sibasLoading: sibasQuery.isLoading,
    kennelLoading: kennelLinksQuery.isLoading,
    communitiesLoading: communitiesQuery.isLoading,
    membershipsLoading: membershipsQuery.isLoading,
  });

  const handleAssignCommunity = async (communityId: string) => {
    if (!authUserId) return;
    setAssigningCommunityId(communityId);
    try {
      await assignUserToCommunity({
        authUserId,
        communityId,
      });
      await queryClient.invalidateQueries({
        queryKey: LEADERBOARD_QUERY_KEYS.memberships,
      });
    } finally {
      setAssigningCommunityId(null);
    }
  };

  const renderWorld = () => {
    if (sibasQuery.isError) {
      return (
        <LeaderboardErrorBanner onRetry={() => void sibasQuery.refetch()} />
      );
    }
    if (!worldLeaderboard.length) {
      return <p className={stls.emptyHint}>{LEADERBOARD_EMPTY_WORLD_HINT}</p>;
    }
    return (
      <LeaderboardSibaList
        rows={worldLeaderboard}
        subtitle="owner"
        onSelectSiba={setSelectedSibaId}
      />
    );
  };

  const renderBreeders = () => {
    if (sibasQuery.isError || kennelLinksQuery.isError) {
      return (
        <LeaderboardErrorBanner
          onRetry={() => {
            void sibasQuery.refetch();
            void kennelLinksQuery.refetch();
          }}
        />
      );
    }
    return breederLeaderboard.length ? (
      <LeaderboardSibaList
        rows={breederLeaderboard}
        subtitle="breeder"
        onSelectSiba={setSelectedSibaId}
      />
    ) : (
      <p className={stls.emptyHint}>{LEADERBOARD_BREEDERS_EMPTY_HINT}</p>
    );
  };

  const renderChats = () => {
    if (
      communitiesQuery.isError ||
      membershipsQuery.isError ||
      sibasQuery.isError
    ) {
      return (
        <LeaderboardErrorBanner
          onRetry={() => {
            void communitiesQuery.refetch();
            void membershipsQuery.refetch();
            void sibasQuery.refetch();
          }}
        />
      );
    }
    return (
      <LeaderboardChatList
        chats={chatLeaderboard}
        myCommunityId={myCommunityId}
        authUserId={authUserId}
        isBreederAccount={Boolean(isBreederAccount)}
        assigningCommunityId={assigningCommunityId}
        onAssignCommunity={handleAssignCommunity}
      />
    );
  };

  return (
    <div className={stls.page}>
      <LeaderboardHeader onBack={() => navigate(PATH.Home)} />
      <LeaderboardInlineTabs tab={tab} onTabChange={setTab} />

      {listLoading ? (
        <LeaderboardListSkeleton />
      ) : tab === "world" ? (
        renderWorld()
      ) : tab === "breeders" ? (
        renderBreeders()
      ) : (
        renderChats()
      )}

      {tab === "world" && myWorldPlace && (
        <LeaderboardMyPlaceBar
          heading="Моё место"
          detailLine={`#${myWorldPlace.place} • ${myWorldPlace.siba_name}`}
          levelValue={myWorldPlace.level ?? 0}
          levelLabel="ур."
        />
      )}

      {tab === "breeders" && myBreederPlace && (
        <LeaderboardMyPlaceBar
          heading="Мой питомник в рейтинге"
          detailLine={`#${myBreederPlace.place} • ${myBreederPlace.siba_name}`}
          levelValue={myBreederPlace.level ?? 0}
          levelLabel="ур. щенков"
        />
      )}

      {tab === "chats" && myCommunity && (
        <LeaderboardMyPlaceBar
          heading="Моё сообщество"
          detailLine={`#${myCommunity.place} • ${myCommunity.title}`}
          levelValue={myCommunity.energy}
          levelLabel="сумм. ур."
        />
      )}

      <MainTabBar active="news" />

      <LeaderboardSibaSheet
        isMobile={isMobile}
        selectedSibaId={selectedSibaId}
        onClose={() => setSelectedSibaId(null)}
      />
    </div>
  );
};
