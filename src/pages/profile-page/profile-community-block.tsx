import { IconPeople } from "../../shared/icons";
import { Button, CommunityBadge, Input } from "../../shared/ui";
import type { Community } from "../../shared/types";
import stls from "./profile.module.sass";

type ProfileCommunityBlockProps = {
  community: Community | null;
  communities: Community[];
  searchValue: string;
  isCreateMode: boolean;
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
  onSearchChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  onToggleCreateMode: () => void;
  onOpenAvatarPicker: () => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectCommunity: (community: Community) => void;
  onJoin: () => void;
  onSaveNew: () => void;
  onLeave: () => void;
  onDelete: () => void;
};

export const ProfileCommunityBlock = ({
  community,
  communities,
  searchValue,
  isCreateMode,
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
  onSearchChange,
  onTitleChange,
  onLinkChange,
  onToggleCreateMode,
  onOpenAvatarPicker,
  onAvatarChange,
  onSelectCommunity,
  onJoin,
  onSaveNew,
  onLeave,
  onDelete,
}: ProfileCommunityBlockProps) => {
  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredCommunities = normalizedSearch
    ? communities
        .filter((item) =>
          [item.title, item.tg_link]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedSearch)),
        )
        .slice(0, 6)
    : communities.slice(0, 6);
  const selectedCommunity =
    communities.find((item) => item.id === selectedCommunityId) ?? null;
  const selectedPreview = selectedCommunity ?? community;

  if (community && !isCreateMode) {
    return (
      <div className={stls.communityStandaloneCard}>
        <div className={stls.communityCardHeader}>Сообщество</div>
        <div className={stls.communitySelectedCard}>
          <div className={stls.communitySelectedTop}>
            <div className={stls.communitySelectedAvatar}>
              {community.avatar_url ? (
                <img
                  className={stls.communitySelectedAvatarImage}
                  src={community.avatar_url}
                  alt={community.title}
                />
              ) : (
                <IconPeople />
              )}
            </div>
            <div className={stls.communitySelectedMeta}>
              <div className={stls.communitySelectedTitle}>{community.title}</div>
              <div className={stls.communitySelectedLink}>{community.tg_link}</div>
            </div>
          </div>
          <CommunityBadge
            title={community.title}
            avatarUrl={community.avatar_url}
            tgLink={community.tg_link}
          />
        </div>
        <div className={stls.communityActions}>
          {isCreator ? (
            <Button
              size="medium"
              variant="secondary"
              loading={isSaving}
              onClick={onDelete}
            >
              Удалить сообщество
            </Button>
          ) : (
            <Button
              size="medium"
              variant="secondary"
              loading={isSaving}
              onClick={onLeave}
            >
              Выйти из сообщества
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={stls.communityStandaloneCard}>
      <div className={stls.communityHeaderRow}>
        <div className={stls.communityCardHeader}>Сообщество</div>
        <button
          type="button"
          className={stls.communityModeButton}
          onClick={onToggleCreateMode}
        >
          {isCreateMode ? "Выбрать существующее" : "Создать своё"}
        </button>
      </div>
      {selectedPreview && (
        <CommunityBadge
          title={selectedPreview.title ?? titleValue}
          avatarUrl={avatarPreviewUrl ?? avatarValue}
          tgLink={selectedPreview.tg_link ?? linkValue}
        />
      )}
      {!isCreateMode ? (
        <>
          <Input
            label="Найти сообщество"
            placeholder="Поиск по названию или ссылке"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {!!filteredCommunities.length && (
            <div className={stls.communitySearchList}>
              {filteredCommunities.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={stls.communitySearchItem}
                  onClick={() => onSelectCommunity(item)}
                >
                  <span className={stls.communitySearchItemAvatar}>
                    {item.avatar_url ? (
                      <img
                        className={stls.communitySearchItemAvatarImage}
                        src={item.avatar_url}
                        alt={item.title}
                      />
                    ) : (
                      <IconPeople />
                    )}
                  </span>
                  <span className={stls.communitySearchItemMeta}>
                    <span className={stls.communitySearchItemTitle}>{item.title}</span>
                    <span className={stls.communitySearchItemLink}>{item.tg_link}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
          <div className={stls.communityActions}>
            <Button
              size="medium"
              loading={isSaving}
              disabled={!selectedCommunityId}
              onClick={onJoin}
            >
              Вступить в сообщество
            </Button>
          </div>
        </>
      ) : (
        <>
          <div
            className={stls.communityAvatarPicker}
            onClick={onOpenAvatarPicker}
          >
            {avatarPreviewUrl ? (
              <img
                className={stls.communityAvatarImage}
                src={avatarPreviewUrl}
                alt="Аватар сообщества"
              />
            ) : avatarValue ? (
              <img
                className={stls.communityAvatarImage}
                src={avatarValue}
                alt="Аватар сообщества"
              />
            ) : (
              <div className={stls.communityAvatarPlaceholder}>
                <IconPeople />
              </div>
            )}
            <input
              ref={communityAvatarInputRef}
              className={stls.inputPhoto}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
            />
          </div>
          {hasUploadedAvatar && (
            <div className={stls.communityUploadHint}>
              Новый аватар будет сохранен вместе с сообществом
            </div>
          )}
          <Input
            label="Название сообщества"
            placeholder="Shiba Club Moscow"
            value={titleValue}
            onChange={(e) => onTitleChange(e.target.value)}
          />
          <Input
            label="Ссылка на сообщество"
            placeholder="https://t.me/..."
            value={linkValue}
            onChange={(e) => onLinkChange(e.target.value)}
          />
          <div className={stls.communityActions}>
            <Button
              size="medium"
              loading={isSaving}
              disabled={!isDirty}
              onClick={onSaveNew}
            >
              Сохранить сообщество
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
