import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@mui/material/Skeleton";
import { clearUserCommunity, fetchUserCommunity } from "../../shared/api/communities";
import { AppContext } from "../../shared/context/app-context";
import stls from "./profile.module.sass";
import { Button, LayoutPage } from "../../shared/ui";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { IconRight } from "../../shared/icons";
import { ProfileAchievements } from "./profile-achievements";
import { ShibaAcademy } from "./shiba-academy";
import { KennelSection } from "./kennel-section";
import { getShibaRank } from "./shiba-academy.data";
import {
  buildEditDrafts,
  deleteAccount,
  fetchHealthAlert,
  fetchMySibaByUserId,
  fetchSibaAcademyProgress,
  fetchSubscribersCount,
  fetchSubscriptionsCount,
  fetchUserById,
  openFilePicker,
  performSignOut,
  profileQueryKeys,
  processCommunityAvatarChange,
  processProfileFileChange,
  submitProfile,
} from "./profile.utils";
import { PATH } from "../../shared/constants/path";
import { getSibaStatus } from "../../shared/utils/siba-status";
import { ProfileHeaderCard } from "./profile-header-card";
import { ProfileOwnerCard } from "./profile-owner-card";
import { ProfileCommunityPreview } from "./profile-community-preview";
import { ProfileEditForm } from "./profile-edit-form";
import { ProfileDeleteDrawer } from "./profile-delete-drawer";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUserId, user, mySiba, setUser, setMySiba, setSibaIns } =
    useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const communityAvatarInputRef = useRef<HTMLInputElement | null>(null);

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
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPromoRevealed, setIsPromoRevealed] = useState(false);
  const [communityTitleDraft, setCommunityTitleDraft] = useState("");
  const [communityLinkDraft, setCommunityLinkDraft] = useState("");
  const [communityAvatarDraft, setCommunityAvatarDraft] = useState("");
  const [communityAvatarFile, setCommunityAvatarFile] = useState<File | null>(null);
  const [communityAvatarPreviewUrl, setCommunityAvatarPreviewUrl] = useState<string | null>(null);
  const [community, setCommunity] = useState<import("../../shared/types").Community | null>(null);

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
    setCommunity(communityQuery.data ?? null);
    setCommunityTitleDraft(communityQuery.data?.title ?? "");
    setCommunityLinkDraft(communityQuery.data?.tg_link ?? "");
    setCommunityAvatarDraft(communityQuery.data?.avatar_url ?? "");
    setCommunityAvatarPreviewUrl(null);
    setCommunityAvatarFile(null);
  }, [communityQuery.data]);

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
        communityTitleDraft,
        communityLinkDraft,
        communityAvatarDraft,
        communityAvatarFile,
        photoFile,
        setError,
        setUser,
        setMySiba,
        setIsEdit,
        setPhotoFile,
        setPhotoPreviewUrl,
        setCommunity,
        setCommunityAvatarFile,
        setCommunityAvatarPreviewUrl,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const currentStatus = mySiba ? getSibaStatus(mySiba) : null;

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
    setCommunityTitleDraft(community?.title ?? "");
    setCommunityLinkDraft(community?.tg_link ?? "");
    setCommunityAvatarDraft(community?.avatar_url ?? "");
    setCommunityAvatarFile(null);
    setCommunityAvatarPreviewUrl(null);
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

  const handlePromoClick = async () => {
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
  };

  const handleClearCommunity = async () => {
    if (!authUserId) return;
    await clearUserCommunity(authUserId);
    setCommunity(null);
    setCommunityTitleDraft("");
    setCommunityLinkDraft("");
    setCommunityAvatarDraft("");
    setCommunityAvatarFile(null);
    setCommunityAvatarPreviewUrl(null);
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
        <ProfileHeaderCard
          authUserId={authUserId}
          mySiba={mySiba}
          community={community}
          isEdit={isEdit}
          photoPreviewUrl={photoPreviewUrl}
          currentStatus={currentStatus}
          academyRank={academyRank}
          subscriptionsCount={subscriptionsCountQuery.data ?? 0}
          subscribersCount={subscribersCountQuery.data ?? 0}
          isHealthLoading={healthAlertQuery.isLoading}
          hasHealthAlert={Boolean(healthAlertQuery.data)}
          fileInputRef={fileInputRef}
          onBack={() => navigate(PATH.Home)}
          onStartEdit={handleStartEdit}
          onOpenHealth={() => navigate(PATH.HealthPass)}
          onOpenFilePicker={() => openFilePicker(fileInputRef)}
          onPhotoChange={handleFileChange}
          setError={setError}
          setMySiba={setMySiba}
          setSibaIns={setSibaIns}
        />
        <ProfileOwnerCard
          user={user}
          isPromoRevealed={isPromoRevealed}
          onPromoClick={handlePromoClick}
        />
        {!isEdit && (
          <ProfileCommunityPreview community={community} mySiba={mySiba} />
        )}
        {isEdit && (
          <ProfileEditForm
            authUserId={authUserId}
            communityAvatarInputRef={communityAvatarInputRef}
            nicknameDraft={nicknameDraft}
            tgNameDraft={tgNameDraft}
            isShowTgNameDraft={isShowTgNameDraft}
            sibaNameDraft={sibaNameDraft}
            sibaGenderDraft={sibaGenderDraft}
            sibaIconDraft={sibaIconDraft}
            communityTitleDraft={communityTitleDraft}
            communityLinkDraft={communityLinkDraft}
            communityAvatarDraft={communityAvatarDraft}
            communityAvatarPreviewUrl={communityAvatarPreviewUrl}
            onNicknameChange={setNicknameDraft}
            onTgNameChange={setTgNameDraft}
            onShowTgNameChange={setIsShowTgNameDraft}
            onSibaNameChange={setSibaNameDraft}
            onSibaGenderChange={setSibaGenderDraft}
            onSibaIconChange={setSibaIconDraft}
            onCommunityTitleChange={setCommunityTitleDraft}
            onCommunityLinkChange={setCommunityLinkDraft}
            onOpenCommunityAvatarPicker={() => openFilePicker(communityAvatarInputRef)}
            onCommunityAvatarChange={(event) =>
              processCommunityAvatarChange(
                event,
                setError,
                setCommunityAvatarFile,
                setCommunityAvatarPreviewUrl,
              )
            }
            onClearCommunity={handleClearCommunity}
          />
        )}
        <ProfileAchievements mySiba={mySiba} />
        <ShibaAcademy sibaId={mySiba?.id} />
        <KennelSection siba={mySiba} authUserId={authUserId ?? undefined} />
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
        <ProfileDeleteDrawer
          open={isDeleteDrawerOpen}
          isDeletingAccount={isDeletingAccount}
          onClose={() => setIsDeleteDrawerOpen(false)}
          onDelete={handleDeleteAccount}
        />
      </div>
    </LayoutPage>
  );
};
