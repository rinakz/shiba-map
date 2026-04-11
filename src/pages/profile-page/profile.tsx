import {
  useContext,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { AppContext } from "../../shared/context/app-context";
import stls from "./profile.module.sass";
import { LayoutPage } from "../../shared/ui";
import { PeopleListOverlay } from "../../shared/ui/people-list-overlay";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Siba } from "../../feature/siba/siba";
import { ProfileAchievements } from "./profile-achievements";
import { ShibaAcademy } from "./shiba-academy";
import { KennelSection } from "./kennel-section";
import { BreederDocumentsSection } from "./breeder-documents-section";
import {
  buildBreederKennelDrafts,
  buildEditDrafts,
  deleteAccount,
  openFilePicker,
  performSignOut,
  processProfileFileChange,
  submitProfile,
  getProfileActionErrorMessage,
} from "./profile.utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchKennelForBreederProfile } from "../../shared/api/breeder";
import { PATH } from "../../shared/constants/path";
import { getSibaStatus } from "../../shared/utils/siba-status";
import { ProfileHeaderCard } from "./profile-header-card";
import { ProfileOwnerCard } from "./profile-owner-card";
import { ProfileEditForm } from "./profile-edit-form";
import { ProfileDeleteDrawer } from "./profile-delete-drawer";
import { ProfileCommunityDrawer } from "./profile-community-drawer";
import { ProfilePageSkeleton } from "./profile-page-skeleton";
import { ProfileBottomActions } from "./profile-bottom-actions";
import { useProfilePageQueries } from "./use-profile-page-queries";
import { useProfileCommunityManager } from "./use-profile-community-manager";

export const ProfilePage = () => {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width:600px)");
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
  const [kennelNameDraft, setKennelNameDraft] = useState("");
  const [kennelPrefixDraft, setKennelPrefixDraft] = useState("");
  const [kennelAddressDraft, setKennelAddressDraft] = useState("");
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isPromoRevealed, setIsPromoRevealed] = useState(false);
  const [peopleListMode, setPeopleListMode] = useState<"followers" | "followings" | null>(null);
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);

  const {
    userQuery,
    mySibaQuery,
    subscriptionsCountQuery,
    subscribersCountQuery,
    healthAlertQuery,
    communityQuery,
    communitiesQuery,
    academyRank,
    peopleListItems,
    peopleListTitle,
    peopleListIsLoading,
    isProfileLoading,
  } = useProfilePageQueries({
    authUserId,
    mySiba,
    peopleListMode,
  });

  const isBreederProfile =
    userQuery.data?.account_type === "breeder" ||
    user?.account_type === "breeder";

  const breederKennelQuery = useQuery({
    queryKey: ["breeder-kennel", authUserId, mySiba?.id],
    queryFn: () =>
      fetchKennelForBreederProfile(authUserId as string, mySiba?.id),
    enabled: Boolean(authUserId && isBreederProfile),
  });

  const scrollToBreederDocuments = () => {
    document
      .getElementById("breeder-documents")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const {
    community,
    communityTitleDraft,
    communityLinkDraft,
    communitySearchDraft,
    communityAvatarDraft,
    communityAvatarFile,
    communityAvatarPreviewUrl,
    isSavingCommunity,
    selectedCommunityId,
    isCreatingCommunity,
    isEditingCommunity,
    isCommunityManagerOpen,
    isCommunityDirty,
    isCommunityCreator,
    setIsCommunityManagerOpen,
    handleClearCommunity,
    handleSelectCommunity,
    handleJoinCommunity,
    handleSaveCommunity,
    handleDeleteCommunity,
    handleStartCommunityEdit,
    handleToggleCreateMode,
    handleCommunitySearchChange,
    handleCommunityTitleChange,
    handleCommunityLinkChange,
    handleCommunityAvatarChange,
    handleOpenCommunityAvatarPicker,
  } = useProfileCommunityManager({
    authUserId,
    communities: communitiesQuery.data ?? [],
    communityFromQuery: communityQuery.data ?? null,
    communityAvatarInputRef,
    setError,
    setUser,
    setMySiba,
  });

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
    if (!isBreederProfile) return;
    const k = buildBreederKennelDrafts(breederKennelQuery.data);
    setKennelNameDraft(k.kennelName);
    setKennelPrefixDraft(k.kennelPrefix);
    setKennelAddressDraft(k.kennelAddress);
  }, [isBreederProfile, breederKennelQuery.data]);

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
      const ok = await submitProfile({
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
        profileKind: isBreederProfile ? "breeder" : "owner",
        kennelId: breederKennelQuery.data?.id,
        kennelNameDraft,
        kennelPrefixDraft,
        kennelAddressDraft,
      });
      if (ok && isBreederProfile) {
        void queryClient.invalidateQueries({ queryKey: ["breeder-kennel"] });
      }
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
    if (isBreederProfile) {
      const k = buildBreederKennelDrafts(breederKennelQuery.data);
      setKennelNameDraft(k.kennelName);
      setKennelPrefixDraft(k.kennelPrefix);
      setKennelAddressDraft(k.kennelAddress);
    } else {
      setSibaNameDraft(drafts.sibaName);
      setSibaGenderDraft(drafts.sibaGender);
      setSibaIconDraft(drafts.sibaIcon);
    }
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

  if (isProfileLoading && !mySiba) {
    return <ProfilePageSkeleton />;
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
          onToggleCommunityManager={() =>
            setIsCommunityManagerOpen((prev) => !prev)
          }
          onOpenSubscriptions={() => setPeopleListMode("followings")}
          onOpenSubscribers={() => setPeopleListMode("followers")}
          onStartEdit={handleStartEdit}
          onOpenHealth={() =>
            isBreederProfile
              ? scrollToBreederDocuments()
              : navigate(PATH.HealthPass)
          }
          onOpenFilePicker={() => openFilePicker(fileInputRef)}
          onPhotoChange={handleFileChange}
          setError={setError}
          setMySiba={setMySiba}
          setSibaIns={setSibaIns}
          breederMode={isBreederProfile}
          breederVerified={Boolean(breederKennelQuery.data?.is_verified)}
        />
        <ProfileOwnerCard
          user={user}
          isPromoRevealed={isPromoRevealed}
          onPromoClick={handlePromoClick}
        />
        {isEdit && (
          <ProfileEditForm
            breederMode={isBreederProfile}
            nicknameDraft={nicknameDraft}
            tgNameDraft={tgNameDraft}
            isShowTgNameDraft={isShowTgNameDraft}
            sibaNameDraft={sibaNameDraft}
            sibaGenderDraft={sibaGenderDraft}
            sibaIconDraft={sibaIconDraft}
            kennelNameDraft={kennelNameDraft}
            kennelPrefixDraft={kennelPrefixDraft}
            kennelAddressDraft={kennelAddressDraft}
            onNicknameChange={setNicknameDraft}
            onTgNameChange={setTgNameDraft}
            onShowTgNameChange={setIsShowTgNameDraft}
            onSibaNameChange={setSibaNameDraft}
            onSibaGenderChange={setSibaGenderDraft}
            onSibaIconChange={setSibaIconDraft}
            onKennelNameChange={setKennelNameDraft}
            onKennelPrefixChange={setKennelPrefixDraft}
            onKennelAddressChange={setKennelAddressDraft}
          />
        )}
        {!isBreederProfile ? (
          <ProfileAchievements mySiba={mySiba} />
        ) : null}
        {!isBreederProfile ? <ShibaAcademy sibaId={mySiba?.id} /> : null}
        <KennelSection
          siba={mySiba}
          authUserId={authUserId ?? undefined}
          accountType={isBreederProfile ? "breeder" : "owner"}
        />
        {isBreederProfile && authUserId ? (
          <div id="breeder-documents">
            <BreederDocumentsSection
              authUserId={authUserId}
              kennel={breederKennelQuery.data ?? null}
              onUpdated={() =>
                void queryClient.invalidateQueries({
                  queryKey: ["breeder-kennel"],
                })
              }
            />
          </div>
        ) : null}
        {error && (
          <span className={stls.errorText}>{error}</span>
        )}
        <ProfileBottomActions
          isEdit={isEdit}
          isSavingProfile={isSavingProfile}
          isSigningOut={isSigningOut}
          onCancelEdit={() => {
            setIsEdit(false);
            setPhotoFile(null);
            setPhotoPreviewUrl(null);
            setError(null);
          }}
          onSave={handleSubmit}
          onOpenDelete={() => setIsDeleteDrawerOpen(true)}
          onSignOut={handleSignOut}
        />
        <ProfileDeleteDrawer
          open={isDeleteDrawerOpen}
          isDeletingAccount={isDeletingAccount}
          onClose={() => setIsDeleteDrawerOpen(false)}
          onDelete={handleDeleteAccount}
        />
        <ProfileCommunityDrawer
          open={isCommunityManagerOpen}
          community={community}
          communities={communitiesQuery.data ?? []}
          searchValue={communitySearchDraft}
          isCreateMode={isCreatingCommunity}
          isEditingMode={isEditingCommunity}
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
          onClose={() => setIsCommunityManagerOpen(false)}
          onSearchChange={handleCommunitySearchChange}
          onTitleChange={handleCommunityTitleChange}
          onLinkChange={handleCommunityLinkChange}
          onToggleCreateMode={handleToggleCreateMode}
          onOpenAvatarPicker={handleOpenCommunityAvatarPicker}
          onAvatarChange={handleCommunityAvatarChange}
          onSelectCommunity={handleSelectCommunity}
          onJoin={handleJoinCommunity}
          onSaveNew={handleSaveCommunity}
          onStartEdit={handleStartCommunityEdit}
          onLeave={handleClearCommunity}
          onDelete={handleDeleteCommunity}
        />
        <PeopleListOverlay
          open={Boolean(peopleListMode)}
          title={peopleListTitle}
          items={peopleListItems}
          isLoading={peopleListIsLoading}
          onItemClick={(item) => {
            setPeopleListMode(null);
            setSelectedSibaId(item.id);
          }}
          onClose={() => setPeopleListMode(null)}
        />
        {isMobile ? (
          <SwipeableDrawer
            anchor="bottom"
            open={Boolean(selectedSibaId)}
            onOpen={() => {}}
            onClose={() => setSelectedSibaId(null)}
            PaperProps={{
              sx: {
                height: "auto",
                maxHeight: "90dvh",
                overflowY: "auto",
                overscrollBehavior: "contain",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: "12px",
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
            maxWidth="sm"
            PaperProps={{
              sx: {
                borderRadius: 2,
                maxHeight: "90dvh",
                overflowY: "auto",
                padding: "12px",
              },
            }}
          >
            {selectedSibaId && <Siba id={selectedSibaId} />}
          </Dialog>
        )}
      </div>
    </LayoutPage>
  );
};
