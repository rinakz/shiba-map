import { useContext, useState } from "react";
import cn from "classnames";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { AppContext } from "../../shared/context/app-context";
import type { ShibaType, ShibaUser } from "../../shared/types";
import { supabase } from "../../shared/api/supabase-сlient";
import stls from "../siba/siba.module.sass";
import { PeopleListOverlay } from "../../shared/ui/people-list-overlay";
import { IconCrown, IconPeople, IconTg, IconRight } from "../../shared/icons";
import { IconVerification } from "../../shared/icons/IconVerification";
import { fetchPublicKennelForBreederSiba } from "../../shared/api/breeder";
import { Button } from "../../shared/ui";
import Skeleton from "@mui/material/Skeleton";
import { getShibaRank } from "../../pages/profile-page/shiba-academy.data";
import { KennelSection } from "../../pages/profile-page/kennel-section";
import { VisitStatsSummary } from "../../pages/profile-page/visit-stats-summary";
import {
  fetchFollowersList,
  fetchFollowingsList,
} from "../../pages/profile-page/profile.utils";
import {
  fetchSibasByKennelId,
  sumSibaLevels,
} from "../../pages/profile-page/kennel-section.utils";
import { SibaLocationMap } from "./siba-location-map";
import { getSibaStatus, isGreenStatus, SHIBA_STATUSES } from "../../shared/utils/siba-status";
import {
  NESTED_SIBA_DIALOG_PAPER_SX,
  NESTED_SIBA_DRAWER_PAPER_SX,
} from "./siba.constants";
import {
  friendsListFromMode,
  friendsListTitle,
  getSibaStatusStyleClasses,
  mapLearnedSkillsToKnownCommands,
  profileDisplayNameFromContext,
  visitStatsTotal,
} from "./siba.utils";

type SibaProps = {
  id: string;
};

export const Siba = ({ id }: SibaProps) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const { sibaIns, authUserId } = useContext(AppContext);
  const queryClient = useQueryClient();

  const siba = sibaIns.find((el: ShibaType) => el.id == id);
  const status = siba ? getSibaStatus(siba) : null;
  const isBreederView = siba?.account_type === "breeder";

  const { data: sibaUser, isLoading: isSibaUserLoading } = useQuery<ShibaUser | undefined>({
    queryKey: ["public-profile", siba?.siba_user_id ?? "unknown"],
    enabled: Boolean(siba?.siba_user_id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("public_profiles")
        .select("user_id, nickname, tgname, is_show_tgname")
        .eq("user_id", siba?.siba_user_id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return (data as ShibaUser | null) ?? undefined;
    },
  });

  const canSubscribe =
    Boolean(siba?.siba_user_id) &&
    Boolean(authUserId) &&
    siba?.siba_user_id !== authUserId;

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [listMode, setListMode] = useState<"followers" | "followings" | null>(null);
  const [selectedNestedSibaId, setSelectedNestedSibaId] = useState<string | null>(null);

  const isSubscribedQuery = useQuery<boolean>({
    queryKey: ["is-subscribed", authUserId, siba?.siba_user_id],
    enabled: Boolean(authUserId && siba?.siba_user_id && canSubscribe),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_friends")
        .select("*", { count: "exact", head: true })
        .eq("user_id", authUserId!)
        .eq("friend_user_id", siba!.siba_user_id);
      if (error) throw error;
      return (count ?? 0) > 0;
    },
  });

  const followersCountQuery = useQuery<number>({
    queryKey: ["user-friends-counts", "followers", siba?.siba_user_id],
    enabled: Boolean(siba?.siba_user_id),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_friends")
        .select("*", { count: "exact", head: true })
        .eq("friend_user_id", siba!.siba_user_id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const followingsCountQuery = useQuery<number>({
    queryKey: ["user-friends-counts", "followings", siba?.siba_user_id],
    enabled: Boolean(siba?.siba_user_id),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("user_friends")
        .select("*", { count: "exact", head: true })
        .eq("user_id", siba!.siba_user_id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const followersListQuery = useQuery<ShibaType[]>({
    queryKey: ["friends-list", "followers", siba?.siba_user_id],
    enabled: Boolean(listMode === "followers" && siba?.siba_user_id),
    queryFn: () => fetchFollowersList(siba!.siba_user_id),
  });

  const followingsListQuery = useQuery<ShibaType[]>({
    queryKey: ["friends-list", "followings", siba?.siba_user_id],
    enabled: Boolean(listMode === "followings" && siba?.siba_user_id),
    queryFn: () => fetchFollowingsList(siba!.siba_user_id),
  });

  const listData = friendsListFromMode(
    listMode,
    followersListQuery.data ?? [],
    followingsListQuery.data ?? [],
  );
  const { statusToneClass, statusCapsuleToneClass, statusDotToneClass } =
    getSibaStatusStyleClasses(stls, status);
  const listTitle = friendsListTitle(listMode);
  const isPeopleListLoading =
    listMode === "followers"
      ? followersListQuery.isLoading
      : listMode === "followings"
        ? followingsListQuery.isLoading
        : false;

  const publicBreederKennelQuery = useQuery({
    queryKey: ["breeder-kennel-public", siba?.id],
    queryFn: () => fetchPublicKennelForBreederSiba(siba!.id),
    enabled: Boolean(isBreederView && siba?.id),
  });

  const breederGraduateLevelSumQuery = useQuery({
    queryKey: [
      "breeder-graduate-level-sum",
      siba?.id,
      publicBreederKennelQuery.data?.id,
    ],
    enabled: Boolean(
      isBreederView && siba?.id && publicBreederKennelQuery.data?.id,
    ),
    queryFn: () =>
      fetchSibasByKennelId(publicBreederKennelQuery.data!.id, {
        excludeSibaId: String(siba!.id),
      }).then((list) => sumSibaLevels(list)),
  });

  const academyProgressQuery = useQuery<{ learned_skill_ids: string[] | null } | null>({
    queryKey: ["siba-academy", siba?.id ?? "none"],
    enabled: Boolean(siba?.id && !isBreederView),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_academy_progress")
        .select("learned_skill_ids")
        .eq("siba_id", siba!.id)
        .maybeSingle();
      if (error) return null;
      return (data as { learned_skill_ids: string[] | null } | null) ?? null;
    },
  });
  const learnedSkillIds = academyProgressQuery.data?.learned_skill_ids ?? [];
  const academyRank = getShibaRank(learnedSkillIds.length).rank;
  const knownCommands = mapLearnedSkillsToKnownCommands(learnedSkillIds);

  const visitTotal = visitStatsTotal(siba);
  const hasVisitStats = visitTotal > 0;

  const profileLevelDisplay = isBreederView
    ? breederGraduateLevelSumQuery.isLoading
      ? null
      : (breederGraduateLevelSumQuery.data ?? 0)
    : (siba?.level ?? 0);

  const handleSubscribe = async () => {
    if (!authUserId || !siba?.siba_user_id) return;
    if (isSubscribing) return;
    if (isSubscribedQuery.data) return;
    try {
      setIsSubscribing(true);
      const { error } = await supabase.from("user_friends").upsert(
        [{ user_id: authUserId, friend_user_id: siba.siba_user_id }],
        { onConflict: "user_id,friend_user_id" },
      );
      if (error) throw error;
      await queryClient.invalidateQueries({
        queryKey: ["user-friends-counts"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["is-subscribed", authUserId, siba?.siba_user_id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["friends-list"],
      });
    } catch (e) {
      console.error("Subscribe error:", e);
    } finally {
      setIsSubscribing(false);
    }
  };

  const isSibaLoading =
    !siba ||
    isSibaUserLoading ||
    (!isBreederView && academyProgressQuery.isLoading) ||
    followersCountQuery.isLoading ||
    followingsCountQuery.isLoading;

  const profileDisplayName = profileDisplayNameFromContext({
    isBreederView,
    kennelName: publicBreederKennelQuery.data?.name,
    sibaName: siba?.siba_name,
  });

  if (isSibaLoading) {
    return (
      <div className={stls.profileContainer}>
        <Skeleton variant="rounded" width={96} height={96} />
        <Skeleton variant="text" width={180} height={48} />
        <Skeleton variant="rounded" width="100%" height={96} />
        <Skeleton variant="rounded" width="100%" height={180} />
      </div>
    );
  }

  return (
    <>
      <div className={stls.profileContainer}>
        <div className={stls.sibaInfoContainer}>
            <div
              className={cn(
                stls.avatarFrame,
                !isBreederView ? statusToneClass : undefined,
                {
                  [stls.wantToWalk]:
                    !isBreederView && isGreenStatus(status),
                  [stls.avatarPulse]:
                    !isBreederView && isGreenStatus(status),
                },
              )}
            >
              <img
                className={stls.avatarImage}
                src={siba?.photos ?? `/${siba?.siba_icon}.png`}
                alt="Сиба"
              />
            </div>
            <div className={stls.characterCard}>
              <div className={stls.titleRow}>
                <div className={stls.nameBlock}>
                  <div className={stls.identityRow}>
                    <h1 className={stls.sibaName}>{profileDisplayName}</h1>
                    {!isBreederView ? (
                      <span className={stls.genderBadge}>
                        {siba?.siba_gender === "male" ? "♂" : "♀"}
                      </span>
                    ) : null}
                    {isBreederView && publicBreederKennelQuery.data?.is_verified ? (
                      <span
                        className={stls.breederVerifiedBadge}
                        title="Питомник верифицирован"
                      >
                        <IconVerification color="#2BB26E" size={18} />
                        Verified Breeder
                      </span>
                    ) : null}
                  </div>
                  {!isBreederView && status ? (
                    <span className={cn(stls.statusCapsule, statusCapsuleToneClass)}>
                      <span className={cn(stls.statusDot, statusDotToneClass)} />
                      {SHIBA_STATUSES.find((item) => item.id === status)?.label}
                    </span>
                  ) : null}
                  {siba?.community_title ? (
                    <div className={stls.communityPanel}>
                      <div className={stls.communityPanelTop}>
                        <span className={stls.communityPanelLabel}>Состоит в чате</span>
                      </div>
                      <a
                        className={stls.communityPanelTitle}
                        href={siba?.community_tg_link ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {siba.community_title}
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className={stls.profileStatsSection}>
                <div className={stls.profileStatsGrid}>
                  <div className={stls.profileStatCell}>
                    <span
                      className={stls.profileStatLabelRow}
                      title={
                        isBreederView
                          ? "Сколько уровней в сумме набрали все сибы питомника, привязанные в приложении"
                          : undefined
                      }
                    >
                      <IconCrown color="#FEAE11" size={14} />
                      {isBreederView ? "Ур. у щенков" : "Level"}
                    </span>
                    <span className={stls.profileStatValue}>
                      {profileLevelDisplay === null ? "…" : profileLevelDisplay}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={`${stls.profileStatCell} ${stls.profileStatButton}`}
                    onClick={() => setListMode("followings")}
                  >
                    <span className={stls.profileStatLabel}>Подписки</span>
                    <span className={stls.profileStatValue}>
                      {followingsCountQuery.data ?? 0}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`${stls.profileStatCell} ${stls.profileStatButton}`}
                    onClick={() => setListMode("followers")}
                  >
                    <span className={stls.profileStatLabel}>Подписчики</span>
                    <span className={stls.profileStatValue}>
                      {followersCountQuery.data ?? 0}
                    </span>
                  </button>
                </div>
              </div>
              {!isBreederView && academyRank ? (
                <div className={stls.roleLoreSection}>
                  <div className={stls.roleLoreCard}>
                    <div className={stls.roleLoreTitle}>
                      {academyRank.icon} {academyRank.rank}
                    </div>
                    <div className={stls.roleLoreQuote}>{academyRank.bossQuote}</div>
                  </div>
                </div>
              ) : null}
            </div>
        </div>
        <div className={stls.ownerCard}>
          <div className={stls.ownerMain}>
            <IconPeople /> {sibaUser?.nickname}
          </div>
          {sibaUser?.is_show_tgname && sibaUser?.tgname?.trim() ? (
            <div className={stls.ownerInfo}>
              <IconTg />
              {sibaUser.tgname.trim()}
            </div>
          ) : null}
          {canSubscribe && !isSubscribedQuery.data && (
            <Button
              size="medium"
              iconRight={<IconRight />}
              onClick={handleSubscribe}
              disabled={isSubscribing || Boolean(isSubscribedQuery.data)}
              loading={isSubscribing || isSubscribedQuery.isLoading}
            >
              Подписаться
            </Button>
          )}
        </div>
        <KennelSection
          siba={siba}
          authUserId={authUserId ?? undefined}
          editable={false}
          accountType={isBreederView ? "breeder" : "owner"}
        />
        {!isBreederView && (knownCommands.length > 0 || hasVisitStats) ? (
          <div className={cn(stls.achievements, stls.achievementsCompact)}>
            {knownCommands.length > 0 ? (
              <div className={stls.commandsSection}>
                <div className={stls.sectionTitle}>Знает команды</div>
                <div className={stls.commandsGrid}>
                  {knownCommands.map((skill) => (
                    <div key={skill.id} className={stls.commandCard}>
                      <span className={stls.commandIcon}>{skill.icon}</span>
                      <span className={stls.commandName}>{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <VisitStatsSummary
              cafe={siba?.cafe ?? 0}
              park={siba?.park ?? 0}
              groomer={siba?.groomer ?? 0}
              compact
            />
          </div>
        ) : null}
        <SibaLocationMap
          coordinates={siba?.coordinates}
          sibaIcon={siba?.siba_icon}
        />
      </div>
      <PeopleListOverlay
        open={Boolean(listMode)}
        title={listTitle}
        items={listData}
        isLoading={isPeopleListLoading}
        onItemClick={(item) => {
          setListMode(null);
          setSelectedNestedSibaId(item.id);
        }}
        onClose={() => setListMode(null)}
      />
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(selectedNestedSibaId)}
          onOpen={() => {}}
          onClose={() => setSelectedNestedSibaId(null)}
          PaperProps={{
            sx: { ...NESTED_SIBA_DRAWER_PAPER_SX },
          }}
        >
          {selectedNestedSibaId && <Siba id={selectedNestedSibaId} />}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={Boolean(selectedNestedSibaId)}
          onClose={() => setSelectedNestedSibaId(null)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: { ...NESTED_SIBA_DIALOG_PAPER_SX },
          }}
        >
          {selectedNestedSibaId && <Siba id={selectedNestedSibaId} />}
        </Dialog>
      )}
    </>
  );
};
