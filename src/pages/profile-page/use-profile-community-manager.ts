import { useEffect, useState, type ChangeEvent, type Dispatch, type RefObject, type SetStateAction } from "react";
import {
  assignUserToCommunity,
  clearUserCommunity,
  deleteCommunity,
  saveUserCommunity,
} from "../../shared/api/communities";
import type { Community, ShibaType, ShibaUser } from "../../shared/types";
import {
  getProfileActionErrorMessage,
  openFilePicker,
  processCommunityAvatarChange,
  uploadCommunityAvatar,
} from "./profile.utils";

type SetUser = Dispatch<SetStateAction<Partial<ShibaUser> | undefined>>;
type SetMySiba = Dispatch<SetStateAction<ShibaType | undefined>>;

type UseProfileCommunityManagerParams = {
  authUserId: string | null;
  communities: Community[];
  communityFromQuery: Community | null;
  communityAvatarInputRef: RefObject<HTMLInputElement | null>;
  setError: (value: string | null) => void;
  setUser: SetUser;
  setMySiba: SetMySiba;
};

export const useProfileCommunityManager = ({
  authUserId,
  communities,
  communityFromQuery,
  communityAvatarInputRef,
  setError,
  setUser,
  setMySiba,
}: UseProfileCommunityManagerParams) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [communityTitleDraft, setCommunityTitleDraft] = useState("");
  const [communityLinkDraft, setCommunityLinkDraft] = useState("");
  const [communitySearchDraft, setCommunitySearchDraft] = useState("");
  const [communityAvatarDraft, setCommunityAvatarDraft] = useState("");
  const [communityAvatarFile, setCommunityAvatarFile] = useState<File | null>(null);
  const [communityAvatarPreviewUrl, setCommunityAvatarPreviewUrl] = useState<string | null>(null);
  const [isSavingCommunity, setIsSavingCommunity] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [isCreatingCommunity, setIsCreatingCommunity] = useState(false);
  const [isCommunityManagerOpen, setIsCommunityManagerOpen] = useState(false);

  useEffect(() => {
    setCommunity(communityFromQuery ?? null);
    setCommunityTitleDraft(communityFromQuery?.title ?? "");
    setCommunityLinkDraft(communityFromQuery?.tg_link ?? "");
    setCommunitySearchDraft(communityFromQuery?.title ?? "");
    setCommunityAvatarDraft(communityFromQuery?.avatar_url ?? "");
    setCommunityAvatarPreviewUrl(null);
    setCommunityAvatarFile(null);
    setSelectedCommunityId(communityFromQuery?.id ?? null);
    setIsCreatingCommunity(false);
    setIsCommunityManagerOpen(false);
  }, [communityFromQuery]);

  const syncCommunityToLocalState = (nextCommunity: Community | null) => {
    setCommunity(nextCommunity);
    setSelectedCommunityId(nextCommunity?.id ?? null);
    setCommunitySearchDraft(nextCommunity?.title ?? "");
    setCommunityTitleDraft(nextCommunity?.title ?? "");
    setCommunityLinkDraft(nextCommunity?.tg_link ?? "");
    setCommunityAvatarDraft(nextCommunity?.avatar_url ?? "");
    setCommunityAvatarFile(null);
    setCommunityAvatarPreviewUrl(null);
    setIsCreatingCommunity(false);
    setIsCommunityManagerOpen(false);
  };

  const syncCommunityToProfile = (nextCommunity: Community | null) => {
    setMySiba((prev) =>
      prev
        ? {
            ...prev,
            community_id: nextCommunity?.id ?? null,
            community_title: nextCommunity?.title ?? null,
            community_avatar_url: nextCommunity?.avatar_url ?? null,
            community_tg_link: nextCommunity?.tg_link ?? null,
          }
        : prev,
    );
    setUser((prev) =>
      prev
        ? {
            ...prev,
            community_id: nextCommunity?.id ?? null,
            community_title: nextCommunity?.title ?? null,
            community_avatar_url: nextCommunity?.avatar_url ?? null,
            community_tg_link: nextCommunity?.tg_link ?? null,
          }
        : prev,
    );
  };

  const handleClearCommunity = async () => {
    if (!authUserId) return;
    setIsSavingCommunity(true);
    try {
      await clearUserCommunity(authUserId);
      syncCommunityToLocalState(null);
      syncCommunityToProfile(null);
      setError(null);
    } catch (error) {
      setError(getProfileActionErrorMessage(error, "Не удалось удалить сообщество."));
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleSelectCommunity = (nextCommunity: Community) => {
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
        communities.find((item) => item.id === selectedCommunityId) ?? null;
      if (!nextCommunity) {
        setError("Не удалось найти выбранное сообщество.");
        return;
      }
      await assignUserToCommunity({ authUserId, communityId: selectedCommunityId });
      syncCommunityToLocalState(nextCommunity);
      syncCommunityToProfile(nextCommunity);
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

      let savedCommunity: Community | null = null;
      if (selectedCommunityId) {
        const selected = communities.find((item) => item.id === selectedCommunityId);
        if (
          selected &&
          selected.title === communityTitleDraft.trim() &&
          selected.tg_link === communityLinkDraft.trim() &&
          !communityAvatarFile
        ) {
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

      syncCommunityToLocalState(savedCommunity);
      syncCommunityToProfile(savedCommunity);
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
      syncCommunityToLocalState(null);
      syncCommunityToProfile(null);
      setError(null);
    } catch (error) {
      setError(getProfileActionErrorMessage(error, "Не удалось удалить сообщество."));
    } finally {
      setIsSavingCommunity(false);
    }
  };

  const handleToggleCreateMode = () => {
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
  };

  const handleCommunitySearchChange = (value: string) => {
    setCommunitySearchDraft(value);
    setSelectedCommunityId(null);
  };

  const handleCommunityTitleChange = (value: string) => {
    setSelectedCommunityId(null);
    setCommunityTitleDraft(value);
  };

  const handleCommunityLinkChange = (value: string) => {
    setSelectedCommunityId(null);
    setCommunityLinkDraft(value);
  };

  const handleCommunityAvatarChange = (event: ChangeEvent<HTMLInputElement>) =>
    processCommunityAvatarChange(
      event,
      setError,
      setCommunityAvatarFile,
      setCommunityAvatarPreviewUrl,
    );

  const isCommunityDirty =
    (community?.title ?? "") !== communityTitleDraft.trim() ||
    (community?.tg_link ?? "") !== communityLinkDraft.trim() ||
    (community?.avatar_url ?? "") !== communityAvatarDraft ||
    Boolean(communityAvatarFile);

  const isCommunityCreator =
    Boolean(authUserId && community?.created_by && community.created_by === authUserId);

  return {
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
    isCommunityManagerOpen,
    isCommunityDirty,
    isCommunityCreator,
    setIsCommunityManagerOpen,
    handleClearCommunity,
    handleSelectCommunity,
    handleJoinCommunity,
    handleSaveCommunity,
    handleDeleteCommunity,
    handleToggleCreateMode,
    handleCommunitySearchChange,
    handleCommunityTitleChange,
    handleCommunityLinkChange,
    handleCommunityAvatarChange,
    handleOpenCommunityAvatarPicker: () => openFilePicker(communityAvatarInputRef),
  };
};
