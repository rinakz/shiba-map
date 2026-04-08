import { SwipeableDrawer } from "@mui/material";
import type { Community } from "../../shared/types";
import { ProfileCommunityBlock } from "./profile-community-block";
import stls from "./profile.module.sass";

type ProfileCommunityDrawerProps = {
  open: boolean;
  community: Community | null;
  communities: Community[];
  searchValue: string;
  isCreateMode: boolean;
  isEditingMode: boolean;
  isCreator: boolean;
  selectedCommunityId: string | null;
  titleValue: string;
  linkValue: string;
  avatarValue: string;
  avatarPreviewUrl: string | null;
  hasUploadedAvatar: boolean;
  isSaving: boolean;
  isDirty: boolean;
  communityAvatarInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  onToggleCreateMode: () => void;
  onOpenAvatarPicker: () => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectCommunity: (community: Community) => void;
  onJoin: () => void;
  onSaveNew: () => void;
  onStartEdit: () => void;
  onLeave: () => void;
  onDelete: () => void;
};

export const ProfileCommunityDrawer = ({
  open,
  community,
  communities,
  searchValue,
  isCreateMode,
  isEditingMode,
  isCreator,
  selectedCommunityId,
  titleValue,
  linkValue,
  avatarValue,
  avatarPreviewUrl,
  hasUploadedAvatar,
  isSaving,
  isDirty,
  communityAvatarInputRef,
  onClose,
  onSearchChange,
  onTitleChange,
  onLinkChange,
  onToggleCreateMode,
  onOpenAvatarPicker,
  onAvatarChange,
  onSelectCommunity,
  onJoin,
  onSaveNew,
  onStartEdit,
  onLeave,
  onDelete,
}: ProfileCommunityDrawerProps) => {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      PaperProps={{
        className: stls.communityDrawerPaper,
      }}
    >
      <div className={stls.communityDrawerContent}>
        <div className={stls.communityDrawerHandle} />
        <div className={stls.communityDrawerHeader}>
          <div className={stls.communityDrawerTitle}>Управление стаей</div>
        </div>
        <ProfileCommunityBlock
          community={community}
          communities={communities}
          searchValue={searchValue}
          isCreateMode={isCreateMode}
          isEditingMode={isEditingMode}
          isCreator={isCreator}
          selectedCommunityId={selectedCommunityId}
          titleValue={titleValue}
          linkValue={linkValue}
          avatarValue={avatarValue}
          avatarPreviewUrl={avatarPreviewUrl}
          hasUploadedAvatar={hasUploadedAvatar}
          isSaving={isSaving}
          isDirty={isDirty}
          communityAvatarInputRef={communityAvatarInputRef}
          onSearchChange={onSearchChange}
          onTitleChange={onTitleChange}
          onLinkChange={onLinkChange}
          onToggleCreateMode={onToggleCreateMode}
          onOpenAvatarPicker={onOpenAvatarPicker}
          onAvatarChange={onAvatarChange}
          onSelectCommunity={onSelectCommunity}
          onJoin={onJoin}
          onSaveNew={onSaveNew}
          onStartEdit={onStartEdit}
          onLeave={onLeave}
          onDelete={onDelete}
        />
      </div>
    </SwipeableDrawer>
  );
};
