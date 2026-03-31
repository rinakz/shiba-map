import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import cn from "classnames";
import { useQuery } from "@tanstack/react-query";
import { Checkbox, Drawer, Switch } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { AppContext } from "../../shared/context/app-context";
import stls from "./profile.module.sass";
import { Button, IconButton, Input, LayoutPage } from "../../shared/ui";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  IconAvatar,
  IconEdit,
  IconFemale,
  IconMale,
  IconPeople,
  IconRight,
  IconSibka,
  IconSibkaBlack,
  IconSibkaWhite,
  IconTg,
} from "../../shared/icons";
import { ProfileAchievements } from "./profile-achievements";
import { ShibaAcademy } from "./shiba-academy";
import { HealthSection } from "./health-section";
import { getShibaRank } from "./shiba-academy.data";
import {
  buildEditDrafts,
  deleteAccount,
  fetchMySibaByUserId,
  fetchSibaAcademyProgress,
  fetchSubscribersCount,
  fetchSubscriptionsCount,
  fetchUserById,
  openFilePicker,
  performSignOut,
  profileQueryKeys,
  processProfileFileChange,
  submitProfile,
  toggleWantToWalk,
} from "./profile.utils";
import { PATH } from "../../shared/constants/path";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUserId, user, mySiba, setUser, setMySiba } =
    useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [tgNameDraft, setTgNameDraft] = useState("");
  const [isShowTgNameDraft, setIsShowTgNameDraft] = useState(false);
  const [sibaNameDraft, setSibaNameDraft] = useState("");
  const [sibaGenderDraft, setSibaGenderDraft] = useState("male");
  const [sibaIconDraft, setSibaIconDraft] = useState("default");
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isWantToWalkLoading, setIsWantToWalkLoading] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPromoRevealed, setIsPromoRevealed] = useState(false);

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

  const completedCommandsCount = academyProgressQuery.data?.learned_skill_ids?.length ?? 0;
  const academyRank = getShibaRank(completedCommandsCount).rank;

  useEffect(() => {
    if (userQuery.data) setUser(userQuery.data);
  }, [userQuery.data, setUser]);

  useEffect(() => {
    if (mySibaQuery.data !== undefined) setMySiba(mySibaQuery.data);
  }, [mySibaQuery.data, setMySiba]);

  useEffect(() => {
    setNicknameDraft(user?.nickname ?? "");
    setTgNameDraft(user?.tgname ?? "");
    setIsShowTgNameDraft(Boolean(user?.is_show_tgname));
  }, [user]);

  useEffect(() => {
    setSibaNameDraft(mySiba?.siba_name ?? "");
    setSibaGenderDraft(mySiba?.siba_gender ?? "male");
    setSibaIconDraft(mySiba?.siba_icon ?? "default");
  }, [mySiba]);

  useEffect(() => {
    const shouldOpenCamera = new URLSearchParams(location.search).get("verify");
    if (shouldOpenCamera !== "1") return;
    if (!mySiba?.id) return;

    setIsEdit(true);
    const timer = window.setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [location.search, mySiba?.id]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) =>
    processProfileFileChange(event, setError, setPhotoFile, setPhotoPreviewUrl);

  const handleSubmit = async () => {
    if (isSavingProfile) return;
    if (!mySiba?.id || !authUserId) {
      setError("Не удалось определить вашу сибу.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await submitProfile({
        authUserId,
        mySiba,
        user,
        nicknameDraft,
        tgNameDraft,
        isShowTgNameDraft,
        sibaNameDraft,
        sibaGenderDraft,
        sibaIconDraft,
        photoFile,
        setError,
        setUser,
        setMySiba,
        setIsEdit,
        setPhotoFile,
        setPhotoPreviewUrl,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleWantToWalk = async () => {
    if (!mySiba?.id || isWantToWalkLoading) return;
    setIsWantToWalkLoading(true);

    try {
      await toggleWantToWalk(mySiba, setError, setMySiba);
    } finally {
      setIsWantToWalkLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!authUserId) return;
    setIsDeletingAccount(true);
    try {
      await deleteAccount(setError, navigate);
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteDrawerOpen(false);
    }
  };

  const handleStartEdit = () => {
    const drafts = buildEditDrafts(user, mySiba);
    setNicknameDraft(drafts.nickname);
    setTgNameDraft(drafts.tgName);
    setIsShowTgNameDraft(drafts.isShowTgName);
    setSibaNameDraft(drafts.sibaName);
    setSibaGenderDraft(drafts.sibaGender);
    setSibaIconDraft(drafts.sibaIcon);
    setIsEdit(true);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await performSignOut(navigate);
    } finally {
      setIsSigningOut(false);
    }
  };

  const isProfileLoading =
    userQuery.isLoading ||
    mySibaQuery.isLoading ||
    subscriptionsCountQuery.isLoading ||
    subscribersCountQuery.isLoading;

  if (isProfileLoading && !mySiba) {
    return (
      <LayoutPage>
        <div className={stls.profileContainer}>
          <Skeleton variant="rounded" width={200} height={200} />
          <Skeleton variant="text" width={220} height={56} />
          <Skeleton variant="rounded" width="100%" height={92} />
          <Skeleton variant="rounded" width="100%" height={180} />
        </div>
      </LayoutPage>
    );
  }

  return (
    <LayoutPage>
      <div className={stls.profileContainer}>
        <div className={stls.sibaInfoContainer}>
          {!isEdit && (
            <div className={stls.topActionsRow}>
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
              <IconButton
                size="medium"
                variant="secondary"
                icon={<IconEdit />}
                onClick={handleStartEdit}
              />
            </div>
          )}
          {!isEdit && mySiba && (
            <div className={stls.walkToggleTop}>
              <label className={stls.walkToggle}>
                <Switch
                  checked={Boolean(mySiba.want_to_walk)}
                  onChange={handleToggleWantToWalk}
                  color="success"
                  disabled={isWantToWalkLoading}
                />
                Хочу гулять
              </label>
            </div>
          )}
          {isEdit ? (
            <div
              className={stls.photoWrapper}
              onClick={() => openFilePicker(fileInputRef)}
            >
              {photoPreviewUrl ? (
                <img
                  className={cn(stls.uploadedPhoto, {
                    [stls.wantToWalk]: mySiba?.want_to_walk,
                  })}
                  src={photoPreviewUrl}
                  alt="Фото"
                />
              ) : mySiba?.photos ? (
                <img
                  className={cn(stls.sibaPhoto, {
                    [stls.wantToWalk]: mySiba?.want_to_walk,
                  })}
                  src={mySiba?.photos}
                  alt="Фото"
                />
              ) : (
                <div className={stls.customInputPhoto}>
                  <IconAvatar />
                </div>
              )}
              <input
                ref={fileInputRef}
                className={stls.inputPhoto}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <img
              className={cn(stls.sibaPhoto, {
                [stls.wantToWalk]: mySiba?.want_to_walk,
              })}
              src={mySiba?.photos ?? `/${mySiba?.siba_icon}.png`}
              alt="Сиба"
            />
          )}
          <div className={stls.titleRow}>
            <div className={stls.nameBlock}>
              <h1 className={stls.sibaName}>{mySiba?.siba_name}</h1>
            </div>
          </div>
          {!isEdit && academyRank && (
            <div className={stls.rankContainer}>
              <div className={stls.academyRankUnderName}>
                {academyRank.icon} {academyRank.rank}
              </div>
              <div className={stls.academyQuoteUnderName}>{academyRank.bossQuote}</div>
            </div>
          )}
          <div className={stls.statsRow}>
            <span className={stls.mutedText}>
              {mySiba?.siba_gender === "male" ? "Мальчик" : "Девочка"}
            </span>
            <span className={stls.mutedText}>
              level: {mySiba?.level ?? 0}
            </span>
          </div>
          <div className={stls.statsRow}>
            <span>Подписки: {subscriptionsCountQuery.data ?? 0}</span>{" "}
            <span>Подписчики: {subscribersCountQuery.data ?? 0}</span>
          </div>
        </div>
        <div className={stls.ownerCard}>
          <div className={stls.ownerMain}>
            <IconPeople /> {user?.nickname}
          </div>
          <div className={stls.ownerInfo}>
            <IconTg />
            {user?.is_show_tgname ? user?.tgname : "Информация скрыта"}
          </div>
          <div className={stls.promoRow}>
            Мой промокод:
            <span
              className={cn(stls.promoValue, { [stls.promoBlur]: !isPromoRevealed })}
              onClick={async () => {
                const code = user?.promo_code ?? "—";
                try {
                  await navigator.clipboard.writeText(code);
                  setError("Промокод скопирован");
                  setIsPromoRevealed(true);
                  window.setTimeout(() => {
                    setIsPromoRevealed(false);
                  }, 2000);
                  setTimeout(() => setError(null), 1200);
                } catch {
                  setError("Не удалось скопировать промокод");
                  setTimeout(() => setError(null), 1200);
                }
              }}
              title="Скопировать"
            >
              {user?.promo_code ?? "—"}
            </span>
          </div>
        </div>
        {isEdit && (
          <div className={stls.editForm}>
            <Input
              label="Никнейм владельца"
              value={nicknameDraft}
              onChange={(e) => setNicknameDraft(e.target.value)}
            />
            <Input
              label="Telegram username"
              value={tgNameDraft}
              onChange={(e) => setTgNameDraft(e.target.value)}
            />
            <label className={stls.checkRow}>
              <Checkbox
                checked={isShowTgNameDraft}
                onChange={(e) => setIsShowTgNameDraft(e.target.checked)}
              />
              Показывать telegram-имя
            </label>
            <Input
              label="Кличка сибы"
              value={sibaNameDraft}
              onChange={(e) => setSibaNameDraft(e.target.value)}
            />
            <div className={stls.fieldGroup}>
              Пол сибы
              <div className={stls.iconRow}>
                <IconButton
                  variant={sibaGenderDraft === "male" ? "pressed" : "primary"}
                  onClick={() => setSibaGenderDraft("male")}
                  size="large"
                  icon={<IconMale />}
                />
                <IconButton
                  variant={sibaGenderDraft === "female" ? "pressed" : "primary"}
                  onClick={() => setSibaGenderDraft("female")}
                  size="large"
                  icon={<IconFemale />}
                />
              </div>
            </div>
            <div className={stls.fieldGroup}>
              Цвет сибы
              <div className={cn(stls.iconRow, stls.iconRowClickable)}>
                <IconButton
                  size="large"
                  variant={sibaIconDraft === "default" ? "pressed" : "primary"}
                  onClick={() => setSibaIconDraft("default")}
                  icon={<IconSibka />}
                />
                <IconButton
                  size="large"
                  variant={sibaIconDraft === "white" ? "pressed" : "primary"}
                  onClick={() => setSibaIconDraft("white")}
                  icon={<IconSibkaWhite />}
                />
                <IconButton
                  size="large"
                  variant={sibaIconDraft === "black" ? "pressed" : "primary"}
                  onClick={() => setSibaIconDraft("black")}
                  icon={<IconSibkaBlack />}
                />
              </div>
            </div>
          </div>
        )}
        <ProfileAchievements mySiba={mySiba} />
        <ShibaAcademy sibaId={mySiba?.id} />
        <HealthSection sibaId={mySiba?.id} />
        {error && (
          <span className={stls.errorText}>{error}</span>
        )}{" "}
        {isEdit ? (
          <div className={stls.editActions}>
            <Button
              size="large"
              variant="secondary"
              disabled={isSavingProfile}
              onClick={() => {
                setIsEdit(false);
                setPhotoFile(null);
                setPhotoPreviewUrl(null);
                setError(null);
              }}
            >
              Отмена
            </Button>
            <Button
              size="large"
              loading={isSavingProfile}
              iconRight={<IconRight />}
              onClick={handleSubmit}
            >
              Сохранить
            </Button>
          </div>
        ) : null}
        <div className={stls.bottomActions}>
          {!isEdit && (
            <Button
              size="medium"
              className={stls.fullWidth}
              variant="secondary"
              onClick={() => setIsDeleteDrawerOpen(true)}
            >
              Удалить аккаунт
            </Button>
          )}
          {!isEdit && (
            <Button
              size="medium"
              className={stls.fullWidth}
              iconRight={<IconRight />}
              loading={isSigningOut}
              onClick={handleSignOut}
            >
              Выйти
            </Button>
          )}
        </div>
        <Drawer
          anchor="bottom"
          open={isDeleteDrawerOpen}
          onClose={() => setIsDeleteDrawerOpen(false)}
        >
          <div className={stls.deleteDrawer}>
            <div className={stls.deleteCard}>
              <h3>Удалить аккаунт?</h3>
              <p>
                Это действие необратимо. Будут удалены данные пользователя и
                сибы.
              </p>
              <div className={stls.deleteActions}>
                <Button
                  size="large"
                  variant="secondary"
                  className={stls.fullWidth}
                  onClick={() => setIsDeleteDrawerOpen(false)}
                >
                  Отмена
                </Button>
                <Button
                  size="large"
                  className={stls.fullWidth}
                  loading={isDeletingAccount}
                  onClick={handleDeleteAccount}
                >
                  Удалить аккаунт
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      </div>
    </LayoutPage>
  );
};
