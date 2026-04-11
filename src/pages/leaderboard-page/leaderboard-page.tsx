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
import { IconButton, MainTabBar } from "../../shared/ui";
import { UserBadge } from "../../shared/ui/user-badge";
import { IconCrown, IconRight, IconTg } from "../../shared/icons";
import { fetchAllSibas } from "../profile-page/profile.utils";
import { getSibaStatus, SIBA_STATUS_LABEL } from "../../shared/utils/siba-status";
import { Siba } from "../../feature/siba/siba";
import { PATH } from "../../shared/constants/path";
import stls from "./leaderboard-page.module.sass";
import {
  LEADERBOARD_BREEDERS_EMPTY_HINT,
  LEADERBOARD_PAGE_SUBTITLE,
  LEADERBOARD_PAGE_TITLE,
  LEADERBOARD_QUERY_KEYS,
  LEADERBOARD_TABS,
} from "./leaderboard-page.constants";
import type { LeaderboardSibaRow, LeaderboardTab, SibaLeaderboardSubtitle } from "./leaderboard-page.types";
import {
  buildBreederLeaderboard,
  buildChatLeaderboard,
  buildWorldLeaderboard,
  chatEnergyBarPercent,
  crownColorByPlace,
} from "./leaderboard-page.utils";

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
    queryKey: LEADERBOARD_QUERY_KEYS.sibas,
    queryFn: fetchAllSibas,
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
    () => buildBreederLeaderboard(sibasQuery.data ?? []),
    [sibasQuery.data],
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

  const myCommunity = useMemo(() => {
    const myMembership = (membershipsQuery.data ?? []).find(
      (item) => item.user_id === authUserId,
    );
    const index = chatLeaderboard.findIndex(
      (item) => item.id === myMembership?.community_id,
    );
    return index >= 0 ? { ...chatLeaderboard[index], place: index + 1 } : null;
  }, [authUserId, chatLeaderboard, membershipsQuery.data]);

  const renderSibaLeaderboard = (
    rows: LeaderboardSibaRow[],
    subtitle: SibaLeaderboardSubtitle,
  ) => (
    <div className={stls.list}>
      {rows.map((item) => {
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
                <UserBadge
                  userName={item.siba_name}
                  nameClassName={stls.name}
                  chatData={{
                    title: item.community_title,
                    avatarUrl: item.community_avatar_url,
                    tgLink: item.community_tg_link,
                  }}
                />
                {item.place <= 3 && (
                  <span className={stls.crownCorner}>
                    <IconCrown color={crownColorByPlace(item.place)} />
                  </span>
                )}
              </div>
              <div className={stls.status}>
                {subtitle === "breeder"
                  ? `Питомник · ${item.followers ?? 0} подписчиков`
                  : status
                    ? SIBA_STATUS_LABEL[status]
                    : (item.rankTitle ?? "Новичок")}
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

  const renderWorld = () => renderSibaLeaderboard(worldLeaderboard, "owner");

  const renderBreeders = () =>
    breederLeaderboard.length ? (
      renderSibaLeaderboard(breederLeaderboard, "breeder")
    ) : (
      <p className={stls.emptyHint}>{LEADERBOARD_BREEDERS_EMPTY_HINT}</p>
    );

  const renderChats = () => {
    const leaderEnergy = chatLeaderboard[0]?.energy ?? 1;
    return (
      <div className={stls.list}>
        {chatLeaderboard.map((chat, index) => {
          const place = index + 1;
          const progress = chatEnergyBarPercent(chat.energy, leaderEnergy);
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
                        queryKey: LEADERBOARD_QUERY_KEYS.memberships,
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
            <h1 className={stls.title}>{LEADERBOARD_PAGE_TITLE}</h1>
          </div>
          <div className={stls.subtle}>{LEADERBOARD_PAGE_SUBTITLE}</div>
        </div>
      </div>

      <div className={stls.tabs}>
        {LEADERBOARD_TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className={cn(stls.tab, tab === key && stls.tabActive)}
            onClick={() => setTab(key)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {tab === "world"
        ? renderWorld()
        : tab === "breeders"
          ? renderBreeders()
          : renderChats()}

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

      {tab === "breeders" && myBreederPlace && (
        <div className={stls.myPlaceBar}>
          <div>
            <div className={stls.myPlaceText}>Мой питомник в рейтинге</div>
            <div className={stls.myPlaceValue}>
              #{myBreederPlace.place} • {myBreederPlace.siba_name}
            </div>
          </div>
          <div className={stls.points}>
            <div className={stls.pointsValue}>{myBreederPlace.points}</div>
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
              maxHeight: "90dvh",
              padding: "12px",
              overflowY: "auto",
              overscrollBehavior: "contain",
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
          PaperProps={{
            sx: { borderRadius: 2, maxHeight: "90dvh", overflowY: "auto", padding: "12px" },
          }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </Dialog>
      )}
    </div>
  );
};
