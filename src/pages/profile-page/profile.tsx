import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@mui/material/Skeleton";
import {
  assignUserToCommunity,
  clearUserCommunity,
  deleteCommunity,
  fetchAllCommunities,
  fetchUserCommunity,
  saveUserCommunity,
} from "../../shared/api/communities";
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
  uploadCommunityAvatar,
  getProfileActionErrorMessage,
} from "./profile.utils";
import { PATH } from "../../shared/constants/path";
import { getSibaStatus } from "../../shared/utils/siba-status";
import { ProfileHeaderCard } from "./profile-header-card";
import { ProfileOwnerCard } from "./profile-owner-card";
import { ProfileEditForm } from "./profile-edit-form";
import { ProfileDeleteDrawer } from "./profile-delete-drawer";
import { ProfileCommunityBlock } from "./profile-community-block";

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
  const [communitySearchDraft, setCommunitySearchDraft] = useState("");
  const [communityAvatarDraft, setCommunityAvatarDraft] = useState("");
  const [communityAvatarFile, setCommunityAvatarFile] = useState<File | null>(null);
  const [communityAvatarPreviewUrl, setCommunityAvatarPreviewUrl] = useState<string | null>(null);
  const [community, setCommunity] = useState<import("../../shared/types").Community | null>(null);
  const [isSavingCommunity, setIsSavingCommunity] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);

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
    setCommunitySearchDraft(communityQuery.data?.title ?? "");
    setCommunityAvatarDraft(communityQuery.data?.avatar_url ?? "");
    setCommunityAvatarPreviewUrl(null);
    setCommunityAvatarFile(null);
    setSelectedCommunityId(communityQuery.data?.id ?? null);
    setIsCreatingCommunity(false);
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
        photoFile,
        setError,
        setUser,
        setMySiba,
        setIsEdit,
        setPhotoFile,
        setPhotoPreviewUrl,
      });
    } catch (error) {
      setError(getProfileActionErrorMessage(error, "Не удалось сохранить профиль."));
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
    setIsEdit(true);
  };

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await performSignOut(navigate);
    } catch (error) {
      setError(getProfileActionErrorMessage(error, "Не удалось выйти из профиля."));
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
    setIsSavingCommunity(true);
    try {
      await clearUserCommunity(authUserId);
      setCommunity(null);
      setSelectedCommunityId(null);
      setCommunityTitleDraft("");
      setCommunityLinkDraft("");
      setCommunitySearchDraft("");
      setCommunityAvatarDraft("");
      setCommunityAvatarFile(null);
      setCommunityAvatarPreviewUrl(null);
      setMySiba((prev) =>
        prev
          ? {
              ...prev,
              community_id: null,
              community_title: null,
              community_avatar_url: null,
              community_tg_link: null,
            }
          : prev,
      );
      setUser((prev) =>
        prev
          ? {
              ...prev,
              community_id: null,
              community_title: null,
              community_avatar_url: null,
              community_tg_link: null,
            }
          : prev,
      );
      setError(null);
    } catch (error) {
      setError(getProfileActionErrorMessage(error, "Не удалось удалить сообщество."));
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleSelectCommunity = (nextCommunity: import("../../shared/types").Community) => {
    setSelectedCommunityId(nextCommunity.id);
    setCommunitySearchDraft(nextCommunity.title);
    setCommunityTitleDraft(nextCommunity.title);
    setCommunityLinkDraft(nextCommunity.tg_link);
    setCommunityAvatarDraft(nextCommunity.avatar_url ?? "");
    setCommunityAvatarFile(null);
    setCommunityAvatarPreviewUrl(null);
  };

  const handleJoinCommunity = async () => {
    if (!authUserId || !selectedCommunityId) return;
    setIsSavingCommunity(true);
    try {
      const nextCommunity =
        (communitiesQuery.data ?? []).find((item) => item.id === selectedCommunityId) ?? null;
      if (!nextCommunity) {
        setError("Не удалось найти выбранное сообщество.");
        return;
      }
      await assignUserToCommunity({ authUserId, communityId: selectedCommunityId });
      setCommunity(nextCommunity);
      setCommunitySearchDraft(nextCommunity.title);
      setCommunityTitleDraft(nextCommunity.title);
      setCommunityLinkDraft(nextCommunity.tg_link);
      setCommunityAvatarDraft(nextCommunity.avatar_url ?? "");
      setCommunityAvatarFile(null);
      setCommunityAvatarPreviewUrl(null);
      setIsCreatingCommunity(false);
      setMySiba((prev) =>
        prev
          ? {
              ...prev,
              community_id: nextCommunity.id,
              community_title: nextCommunity.title,
              community_avatar_url: nextCommunity.avatar_url ?? null,
              community_tg_link: nextCommunity.tg_link,
            }
          : prev,
      );
      setUser((prev) =>
        prev
          ? {
              ...prev,
              community_id: nextCommunity.id,
              community_title: nextCommunity.title,
              community_avatar_url: nextCommunity.avatar_url ?? null,
              community_tg_link: nextCommunity.tg_link,
            }
          : prev,
      );
      setError(null);
    } catch (error) {
      setError(getProfileActionErrorMessage(error, "Не удалось вступить в сообщество."));
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleSaveCommunity = async () => {
    if (!authUserId) return;
    setIsSavingCommunity(true);
    try {
      let avatarUrl = communityAvatarDraft;
      if (communityAvatarFile) {
        avatarUrl = await uploadCommunityAvatar(authUserId, communityAvatarFile);
      }

      let savedCommunity = null;
      if (selectedCommunityId) {
        const selected = (communitiesQuery.data ?? []).find((item) => item.id === selectedCommunityId);
        if (selected && selected.title === communityTitleDraft.trim() && selected.tg_link === communityLinkDraft.trim() && !communityAvatarFile) {
          await assignUserToCommunity({ authUserId, communityId: selected.id });
          savedCommunity = selected;
        }
      }

      if (!savedCommunity) {
        savedCommunity = await saveUserCommunity({
          authUserId,
          title: communityTitleDraft,
          tgLink: communityLinkDraft,
          avatarUrl: avatarUrl ?? "",
        });
      }

      setCommunity(savedCommunity);
      setSelectedCommunityId(savedCommunity?.id ?? null);
      setCommunitySearchDraft(savedCommunity?.title ?? "");
      setCommunityTitleDraft(savedCommunity?.title ?? "");
      setCommunityLinkDraft(savedCommunity?.tg_link ?? "");
      setCommunityAvatarDraft(savedCommunity?.avatar_url ?? "");
      setCommunityAvatarFile(null);
      setCommunityAvatarPreviewUrl(null);
      setIsCreatingCommunity(false);
      setMySiba((prev) =>
        prev
          ? {
              ...prev,
              community_id: savedCommunity?.id ?? null,
              community_title: savedCommunity?.title ?? null,
              community_avatar_url: savedCommunity?.avatar_url ?? null,
              community_tg_link: savedCommunity?.tg_link ?? null,
            }
          : prev,
      );
      setUser((prev) =>
        prev
          ? {
              ...prev,
              community_id: savedCommunity?.id ?? null,
              community_title: savedCommunity?.title ?? null,
              community_avatar_url: savedCommunity?.avatar_url ?? null,
              community_tg_link: savedCommunity?.tg_link ?? null,
            }
          : prev,
      );
      setError(null);
    } catch (error) {
      setError(getProfileActionErrorMessage(error, "Не удалось сохранить сообщество."));
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleDeleteCommunity = async () => {
    if (!community?.id) return;
    setIsSavingCommunity(true);
    try {
      await deleteCommunity(community.id);
      setCommunity(null);
      setSelectedCommunityId(null);
      setCommunityTitleDraft("");
      setCommunityLinkDraft("");
      setCommunitySearchDraft("");
      setCommunityAvatarDraft("");
      setCommunityAvatarFile(null);
      setCommunityAvatarPreviewUrl(null);
      setIsCreatingCommunity(false);
      setMySiba((prev) =>
        prev
          ? {
              ...prev,
              community_id: null,
              community_title: null,
              community_avatar_url: null,
              community_tg_link: null,
            }
          : prev,
      );
      setUser((prev) =>
        prev
          ? {
              ...prev,
              community_id: null,
              community_title: null,
              community_avatar_url: null,
              community_tg_link: null,
            }
          : prev,
      );
      setError(null);
    } catch (error) {
      setError(getProfileActionErrorMessage(error, "Не удалось удалить сообщество."));
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const isCommunityDirty =
    (community?.title ?? "") !== communityTitleDraft.trim() ||
    (community?.tg_link ?? "") !== communityLinkDraft.trim() ||
    (community?.avatar_url ?? "") !== communityAvatarDraft ||
    Boolean(communityAvatarFile);
  const isCommunityCreator =
    Boolean(authUserId && community?.created_by && community.created_by === authUserId);

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
        <ProfileCommunityBlock
          community={community}
          communities={communitiesQuery.data ?? []}
          searchValue={communitySearchDraft}
          isCreateMode={isCreatingCommunity}
          isCreator={isCommunityCreator}
          selectedCommunityId={selectedCommunityId}
          titleValue={communityTitleDraft}
          linkValue={communityLinkDraft}
          avatarValue={communityAvatarDraft}
          avatarPreviewUrl={communityAvatarPreviewUrl}
          hasUploadedAvatar={Boolean(communityAvatarFile)}
          isSaving={isSavingCommunity}
          isDirty={isCommunityDirty}
          communityAvatarInputRef={communityAvatarInputRef}
          onSearchChange={(value) => {
            setCommunitySearchDraft(value);
            setSelectedCommunityId(null);
          }}
          onTitleChange={(value) => {
            setSelectedCommunityId(null);
            setCommunityTitleDraft(value);
          }}
          onLinkChange={(value) => {
            setSelectedCommunityId(null);
            setCommunityLinkDraft(value);
          }}
          onToggleCreateMode={() => {
            const nextIsCreating = !isCreatingCommunity;
            setIsCreatingCommunity(nextIsCreating);
            setSelectedCommunityId(null);
            setCommunitySearchDraft("");
            if (nextIsCreating) {
              setCommunityTitleDraft("");
              setCommunityLinkDraft("");
              setCommunityAvatarDraft("");
              setCommunityAvatarFile(null);
              setCommunityAvatarPreviewUrl(null);
            }
          }}
          onOpenAvatarPicker={() => openFilePicker(communityAvatarInputRef)}
          onAvatarChange={(event) =>
            processCommunityAvatarChange(
              event,
              setError,
              setCommunityAvatarFile,
              setCommunityAvatarPreviewUrl,
            )
          }
          onSelectCommunity={handleSelectCommunity}
          onJoin={handleJoinCommunity}
          onSaveNew={handleSaveCommunity}
          onLeave={handleClearCommunity}
          onDelete={handleDeleteCommunity}
        />
        {isEdit && (
          <ProfileEditForm
            nicknameDraft={nicknameDraft}
            tgNameDraft={tgNameDraft}
            isShowTgNameDraft={isShowTgNameDraft}
            sibaNameDraft={sibaNameDraft}
            sibaGenderDraft={sibaGenderDraft}
            sibaIconDraft={sibaIconDraft}
            onNicknameChange={setNicknameDraft}
            onTgNameChange={setTgNameDraft}
            onShowTgNameChange={setIsShowTgNameDraft}
            onSibaNameChange={setSibaNameDraft}
            onSibaGenderChange={setSibaGenderDraft}
            onSibaIconChange={setSibaIconDraft}
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
