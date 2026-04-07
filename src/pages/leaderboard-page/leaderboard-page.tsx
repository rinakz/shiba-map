import { useContext, useMemo, useState } from "react";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import cn from "classnames";
import { useNavigate } from "react-router-dom";
import {
  assignUserToCommunity,
  fetchAllCommunities,
  fetchCommunityMemberships,
} from "../../shared/api/communities";
import { AppContext } from "../../shared/context/app-context";
import { CommunityBadge, IconButton, MainTabBar } from "../../shared/ui";
import { IconCrown, IconGlobe, IconRight, IconTg } from "../../shared/icons";
import { fetchAllSibas } from "../profile-page/profile.utils";
import {
  getSibaStatus,
  SIBA_STATUS_LABEL,
} from "../../shared/utils/siba-status";
import { getShibaRank } from "../profile-page/shiba-academy.data";
import { Siba } from "../../feature/siba/siba";
import { PATH } from "../../shared/constants/path";
import stls from "./leaderboard-page.module.sass";

type LeaderboardTab = "world" | "chats";

type CommunityRow = {
  id: string;
  title: string;
  avatarUrl: string | null;
  tgLink: string;
  participants: number;
  energy: number;
  gapToLeader: number;
  isLeader: boolean;
};

const crownColorByPlace = (place: number) => {
  if (place === 1) return "#FEAE11";
  if (place === 2) return "#C4CAD4";
  if (place === 3) return "#CD7F32";
  return "#E7E1D2";
};

export const LeaderboardPage = () => {
  const { authUserId } = useContext(AppContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [tab, setTab] = useState<LeaderboardTab>("world");
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [assigningCommunityId, setAssigningCommunityId] = useState<
    string | null
  >(null);

  const sibasQuery = useQuery({
    queryKey: ["leaderboard", "sibas"],
    queryFn: fetchAllSibas,
    enabled: Boolean(authUserId),
  });

  const communitiesQuery = useQuery({
    queryKey: ["leaderboard", "communities"],
    enabled: Boolean(authUserId),
    queryFn: fetchAllCommunities,
  });
  const membershipsQuery = useQuery({
    queryKey: ["leaderboard", "community-memberships"],
    enabled: Boolean(authUserId),
    queryFn: fetchCommunityMemberships,
  });

  const worldLeaderboard = useMemo(() => {
    return [...(sibasQuery.data ?? [])]
      .sort((a, b) => {
        const levelDiff = (b.level ?? 0) - (a.level ?? 0);
        if (levelDiff !== 0) return levelDiff;
        return (b.followers ?? 0) - (a.followers ?? 0);
      })
      .map((siba, index) => ({
        ...siba,
        place: index + 1,
        points: (siba.level ?? 0) * 100 + (siba.followers ?? 0) * 5,
        rankTitle: getShibaRank(siba.level ?? 0).rank?.rank ?? "Новичок",
      }));
  }, [sibasQuery.data]);

  const myWorldPlace = useMemo(() => {
    return (
      worldLeaderboard.find((item) => item.siba_user_id === authUserId) ?? null
    );
  }, [authUserId, worldLeaderboard]);

  const chatLeaderboard = useMemo<CommunityRow[]>(() => {
    const communities = communitiesQuery.data ?? [];
    const memberships = membershipsQuery.data ?? [];
    const sibas = sibasQuery.data ?? [];
    const sibaByUser = new Map(sibas.map((siba) => [siba.siba_user_id, siba]));
    const sorted = communities
      .map((community) => {
        const members = memberships.filter(
          (membership) => membership.community_id === community.id,
        );
        const energy = members.reduce((sum, membership) => {
          const siba = sibaByUser.get(membership.user_id);
          return sum + (siba?.level ?? 0) * 100 + (siba?.followers ?? 0) * 5;
        }, 0);
        return {
          id: community.id,
          title: community.title,
          avatarUrl: community.avatar_url ?? null,
          tgLink: community.tg_link,
          participants: members.length,
          energy,
        };
      })
      .sort((a, b) => b.energy - a.energy);
    const leaderEnergy = sorted[0]?.energy ?? 0;

    return sorted.map((group, index) => ({
      id: group.id,
      title: group.title,
      avatarUrl: group.avatarUrl,
      tgLink: group.tgLink,
      participants: group.participants,
      energy: group.energy,
      gapToLeader: index === 0 ? 0 : Math.max(leaderEnergy - group.energy, 0),
      isLeader: index === 0,
    }));
  }, [communitiesQuery.data, membershipsQuery.data, sibasQuery.data]);

  const myCommunity = useMemo(() => {
    const myMembership = (membershipsQuery.data ?? []).find(
      (item) => item.user_id === authUserId,
    );
    const index = chatLeaderboard.findIndex(
      (item) => item.id === myMembership?.community_id,
    );
    return index >= 0 ? { ...chatLeaderboard[index], place: index + 1 } : null;
  }, [authUserId, chatLeaderboard, membershipsQuery.data]);

  const renderWorld = () => (
    <div className={stls.list}>
      {worldLeaderboard.map((item) => {
        const isTop = item.place <= 3;
        const status = getSibaStatus(item);
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              stls.card,
              isTop && stls.cardTop,
              item.place === 1 && stls.cardTop1,
              item.place === 2 && stls.cardTop2,
              item.place === 3 && stls.cardTop3,
            )}
            onClick={() => setSelectedSibaId(item.id)}
          >
            <div className={stls.place}>{item.place}</div>
            <div className={stls.avatarWrap}>
              <img
                className={stls.avatar}
                src={item.photos ?? `/${item.siba_icon}.png`}
                alt={item.siba_name}
              />
            </div>
            <div className={stls.content}>
              <div className={stls.nameRow}>
                <div className={stls.name}>{item.siba_name}</div>
                {item.place <= 3 && (
                  <span className={stls.crownCorner}>
                    <IconCrown color={crownColorByPlace(item.place)} />
                  </span>
                )}
              </div>
              <CommunityBadge
                title={item.community_title}
                avatarUrl={item.community_avatar_url}
                tgLink={item.community_tg_link}
              />
              <div className={stls.status}>
                {status ? SIBA_STATUS_LABEL[status] : item.rankTitle}
              </div>
            </div>
            <div className={stls.points}>
              <div className={stls.pointsValue}>{item.points}</div>
              <div className={stls.pointsLabel}>баллов</div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderChats = () => {
    const leaderEnergy = chatLeaderboard[0]?.energy ?? 1;
    return (
      <div className={stls.list}>
        {chatLeaderboard.map((chat, index) => {
          const place = index + 1;
          const progress = Math.max(
            8,
            Math.round((chat.energy / leaderEnergy) * 100),
          );
          const isMyCommunity = myCommunity?.id === chat.id;
          const canAssign = Boolean(authUserId && !myCommunity);
          return (
            <div
              key={chat.id}
              className={cn(stls.card, place <= 3 && stls.cardTop)}
            >
              <div className={stls.place}>{place}</div>
              <div className={stls.avatarWrap}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#FFF4DE",
                  }}
                >
                  {chat.avatarUrl ? (
                    <img
                      className={stls.avatar}
                      src={chat.avatarUrl}
                      alt={chat.title}
                    />
                  ) : (
                    <IconTg />
                  )}
                </div>
              </div>
              <div className={stls.content}>
                <div className={stls.nameRow}>
                  <div className={stls.name}>{chat.title}</div>
                  {place <= 3 && (
                    <span className={stls.crownCorner}>
                      <IconCrown color={crownColorByPlace(place)} />
                    </span>
                  )}
                </div>
                <div className={stls.chatMeta}>
                  {chat.participants} участников в приложении • {chat.energy}{" "}
                  энергии
                </div>
                {chat.isLeader ? (
                  <div className={stls.leaderBadge}>Лидирующий чат</div>
                ) : (
                  <div className={stls.chatMeta}>
                    До лидера осталось: {chat.gapToLeader} очков
                  </div>
                )}
                <div className={stls.energyBar}>
                  <div
                    className={stls.energyFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
              {isMyCommunity ? (
                <span className={stls.chatAction}>Я из этого чата</span>
              ) : canAssign ? (
                <button
                  type="button"
                  className={stls.chatAction}
                  onClick={async () => {
                    setAssigningCommunityId(chat.id);
                    try {
                      await assignUserToCommunity({
                        authUserId: authUserId as string,
                        communityId: chat.id,
                      });
                      await queryClient.invalidateQueries({
                        queryKey: ["leaderboard", "community-memberships"],
                      });
                    } finally {
                      setAssigningCommunityId(null);
                    }
                  }}
                  disabled={assigningCommunityId === chat.id}
                >
                  {assigningCommunityId === chat.id
                    ? "Сохраняем..."
                    : "Я из этого чата"}
                </button>
              ) : (
                <a
                  className={stls.chatAction}
                  href={chat.tgLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Вступить
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={stls.page}>
      <div className={stls.headerRow}>
        <IconButton
          size="medium"
          variant="secondary"
          icon={
            <span style={{ display: "flex", transform: "rotate(-180deg)" }}>
              <IconRight />
            </span>
          }
          onClick={() => navigate(PATH.Home)}
        />
        <div>
          <div className={stls.titleWrap}>
            <IconCrown />
            <h1 className={stls.title}>Лидеры Сиба-мира</h1>
          </div>
          <div className={stls.subtle}>Топ сиб и сообществ</div>
        </div>
      </div>

      <div className={stls.tabs}>
        <button
          type="button"
          className={cn(stls.tab, tab === "world" && stls.tabActive)}
          onClick={() => setTab("world")}
        >
          <IconGlobe />
          Весь мир
        </button>
        <button
          type="button"
          className={cn(stls.tab, tab === "chats" && stls.tabActive)}
          onClick={() => setTab("chats")}
        >
          <IconTg />
          Чаты
        </button>
      </div>

      {tab === "world" ? renderWorld() : renderChats()}

      {tab === "world" && myWorldPlace && (
        <div className={stls.myPlaceBar}>
          <div>
            <div className={stls.myPlaceText}>Моё место</div>
            <div className={stls.myPlaceValue}>
              #{myWorldPlace.place} • {myWorldPlace.siba_name}
            </div>
          </div>
          <div className={stls.points}>
            <div className={stls.pointsValue}>{myWorldPlace.points}</div>
            <div className={stls.pointsLabel}>баллов</div>
          </div>
        </div>
      )}

      {tab === "chats" && myCommunity && (
        <div className={stls.myPlaceBar}>
          <div>
            <div className={stls.myPlaceText}>Моё сообщество</div>
            <div className={stls.myPlaceValue}>
              #{myCommunity.place} • {myCommunity.title}
            </div>
          </div>
          <div className={stls.points}>
            <div className={stls.pointsValue}>{myCommunity.energy}</div>
            <div className={stls.pointsLabel}>энергии</div>
          </div>
        </div>
      )}

      <MainTabBar active="news" />

      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(selectedSibaId)}
          onClose={() => setSelectedSibaId(null)}
          onOpen={() => {}}
          PaperProps={{
            sx: {
              height: "auto",
              maxHeight: "85vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={Boolean(selectedSibaId)}
          onClose={() => setSelectedSibaId(null)}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </Dialog>
      )}
    </div>
  );
};
