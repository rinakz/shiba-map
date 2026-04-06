import { useContext, useState } from "react";
import cn from "classnames";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppContext } from "../../shared/context/app-context";
import type { ShibaType, ShibaUser } from "../../shared/types";
import { supabase } from "../../shared/api/supabase-сlient";
import stls from "../siba/siba.module.sass";
import { LayoutPage, ProgressBar } from "../../shared/ui";
import { IconCafe, IconGroomer, IconPark, IconPeople, IconTg, IconRight } from "../../shared/icons";
import { Button } from "../../shared/ui";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import {
  getAchievementPercent,
  getShibaRank,
  shibaSkills,
} from "../../pages/profile-page/shiba-academy.data";
import { KennelSection } from "../../pages/profile-page/kennel-section";
import { getSibaStatus, getSibaStatusColor, isGreenStatus, SHIBA_STATUSES } from "../../shared/utils/siba-status";

type SibaProps = {
  id: string;
};

export const Siba = ({ id }: SibaProps) => {
  const { sibaIns, authUserId } = useContext(AppContext);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width:600px)");

  const siba = sibaIns.find((el: ShibaType) => el.id == id);
  const status = siba ? getSibaStatus(siba) : null;

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
    enabled: Boolean(authUserId && siba?.siba_user_id),
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
    enabled: Boolean(authUserId && siba?.siba_user_id),
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
    queryFn: async () => {
      const { data: links, error: linksError } = await supabase
        .from("user_friends")
        .select("user_id")
        .eq("friend_user_id", siba!.siba_user_id);
      if (linksError) throw linksError;
      const userIds = (links ?? []).map((x: { user_id: string }) => x.user_id);
      if (!userIds.length) return [];
      const { data: sibas, error: sibasError } = await supabase
        .from("sibains")
        .select("*")
        .in("siba_user_id", userIds);
      if (sibasError) throw sibasError;
      return (sibas ?? []) as ShibaType[];
    },
  });

  const followingsListQuery = useQuery<ShibaType[]>({
    queryKey: ["friends-list", "followings", siba?.siba_user_id],
    enabled: Boolean(listMode === "followings" && siba?.siba_user_id),
    queryFn: async () => {
      const { data: links, error: linksError } = await supabase
        .from("user_friends")
        .select("friend_user_id")
        .eq("user_id", siba!.siba_user_id);
      if (linksError) throw linksError;
      const userIds = (links ?? []).map((x: { friend_user_id: string }) => x.friend_user_id);
      if (!userIds.length) return [];
      const { data: sibas, error: sibasError } = await supabase
        .from("sibains")
        .select("*")
        .in("siba_user_id", userIds);
      if (sibasError) throw sibasError;
      return (sibas ?? []) as ShibaType[];
    },
  });

  const listData =
    listMode === "followers"
      ? (followersListQuery.data ?? [])
      : listMode === "followings"
      ? (followingsListQuery.data ?? [])
      : [];

  const academyProgressQuery = useQuery<{ learned_skill_ids: string[] | null } | null>({
    queryKey: ["siba-academy", siba?.id ?? "none"],
    enabled: Boolean(siba?.id),
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
  const knownCommands = learnedSkillIds
    .map((skillId) => shibaSkills.find((skill) => skill.id === skillId))
    .filter((skill): skill is (typeof shibaSkills)[number] => Boolean(skill))
    .slice(0, 8);

  const handleSubscribe = async () => {
    if (!authUserId || !siba?.siba_user_id) return;
    if (isSubscribing) return;
    if (isSubscribedQuery.data) return;
    try {
      setIsSubscribing(true);

      // Создать связь друзей (в обе стороны): подписка взаимная.
      await supabase.from("user_friends").upsert(
        [
          { user_id: authUserId, friend_user_id: siba.siba_user_id },
          { user_id: siba.siba_user_id, friend_user_id: authUserId },
        ],
        { onConflict: "user_id,friend_user_id" },
      );
      // Счётчики считаем из user_friends, поэтому достаточно инвалидации.
      await queryClient.invalidateQueries({
        queryKey: ["user-friends-counts"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["is-subscribed", authUserId, siba?.siba_user_id],
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
    academyProgressQuery.isLoading ||
    followersCountQuery.isLoading ||
    followingsCountQuery.isLoading;

  if (isSibaLoading) {
    return (
      <LayoutPage>
        <div className={stls.profileContainer}>
          <Skeleton variant="rounded" width={96} height={96} />
          <Skeleton variant="text" width={180} height={48} />
          <Skeleton variant="rounded" width="100%" height={96} />
          <Skeleton variant="rounded" width="100%" height={180} />
        </div>
      </LayoutPage>
    );
  }

  return (
    <LayoutPage>
      <>
        <div className={stls.profileContainer}>
          <div className={stls.sibaInfoContainer}>
          <div
            className={cn(stls.avatarFrame, {
              [stls.wantToWalk]: isGreenStatus(status),
              [stls.avatarPulse]: isGreenStatus(status),
            })}
            style={{
              borderColor: status ? getSibaStatusColor(status) : "transparent",
            }}
          >
            <img
              className={stls.avatarImage}
              src={siba?.photos ?? `/${siba?.siba_icon}.png`}
              alt="Сиба"
            />
          </div>
          <h1 className={stls.sibaName}>{siba?.siba_name}</h1>
          {status && (
            <span
              className={stls.statusCapsule}
              style={{ borderColor: getSibaStatusColor(status) }}
            >
              <span
                className={stls.statusDot}
                style={{ backgroundColor: getSibaStatusColor(status) }}
              />
              {SHIBA_STATUSES.find((s) => s.id === status)?.label}
            </span>
          )}
          {academyRank && (
            <>
              <div className={stls.rankUnderAvatar}>
                {academyRank.icon} {academyRank.rank}
              </div>
              <div className={stls.rankQuoteUnderAvatar}>{academyRank.bossQuote}</div>
            </>
          )}
          <div className={stls.statsRow}>
            <span className={stls.mutedText}>
              {siba?.siba_gender === "male" ? "Мальчик" : "Девочка"}
            </span>
            <span className={stls.mutedText}>level: {siba?.level ?? 0}</span>
          </div>
          <div className={stls.statsRow}>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setListMode("followers")}
            >
              Подписки: {followersCountQuery.data ?? 0}
            </span>{" "}
            <span
              style={{ cursor: "pointer" }}
              onClick={() => setListMode("followings")}
            >
              Подписчики: {followingsCountQuery.data ?? 0}
            </span>
          </div>
        </div>
        <div className={stls.ownerCard}>
          <div className={stls.ownerMain}>
            <IconPeople /> {sibaUser?.nickname}
          </div>
          <div className={stls.ownerInfo}>
            <IconTg />
            {sibaUser?.is_show_tgname ? sibaUser?.tgname : "Информация скрыта"}
          </div>
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
        <KennelSection siba={siba} authUserId={authUserId ?? undefined} editable={false} />
        <div className={stls.achievements}>
          {knownCommands.length > 0 && (
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
          )}
          <div className={stls.sectionTitle}>Достижения</div>
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconCafe />
              <p>Кафе</p>
            </div>
            <ProgressBar value={siba?.cafe ?? 0} color="#7A7B7B" />
            <span>{getAchievementPercent(siba?.cafe ?? 0)}%</span>
          </div>
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconPark />
              <p>Парки </p>
            </div>{" "}
            <ProgressBar value={siba?.park ?? 0} color="#2BB26E" />
            <span>{getAchievementPercent(siba?.park ?? 0)}%</span>
          </div>
          <div className={stls.progressContainer}>
            <div className={stls.progressTitle}>
              <IconGroomer />
              <p>Грумер </p>
            </div>
            <ProgressBar value={siba?.groomer ?? 0} color="#333944" />
            <span>{getAchievementPercent(siba?.groomer ?? 0)}%</span>
          </div>
        </div>
      </div>
        {isMobile ? (
          <SwipeableDrawer
            anchor="bottom"
            open={Boolean(listMode)}
            onOpen={() => {}}
            onClose={() => setListMode(null)}
            PaperProps={{
              sx: {
                height: "auto",
                maxHeight: "85vh",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              },
            }}
          >
            <div style={{ padding: 12 }}>
              <h3>{listMode === "followers" ? "Подписки" : "Подписчики"}</h3>
              {listData.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <img
                    src={item.photos ?? `/${item.siba_icon}.png`}
                    alt={item.siba_name}
                    style={{ width: 28, height: 28, borderRadius: 14, objectFit: "cover" }}
                  />
                  <span>{item.siba_name}</span>
                </div>
              ))}
            </div>
          </SwipeableDrawer>
        ) : (
          <Dialog
            open={Boolean(listMode)}
            onClose={() => setListMode(null)}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: { borderRadius: 2 } }}
          >
            <div style={{ padding: 12 }}>
              <h3>{listMode === "followers" ? "Подписки" : "Подписчики"}</h3>
              {listData.map((item) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <img
                    src={item.photos ?? `/${item.siba_icon}.png`}
                    alt={item.siba_name}
                    style={{ width: 28, height: 28, borderRadius: 14, objectFit: "cover" }}
                  />
                  <span>{item.siba_name}</span>
                </div>
              ))}
            </div>
          </Dialog>
        )}
      </>
    </LayoutPage>
  );
};
