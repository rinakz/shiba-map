import { IconDelete, IconPeople } from "../../shared/icons";
import { Button, Input, OpenableCommunityBadge } from "../../shared/ui";
import type { Community } from "../../shared/types";
import placeStls from "../../feature/map/place-sheet.module.sass";
import stls from "./profile.module.sass";

export const COMMUNITY_AVATAR_PHOTO_INPUT_ID = "community-avatar-photo";

type ProfileCommunityBlockProps = {
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
  onSearchChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onLinkChange: (value: string) => void;
  onToggleCreateMode: () => void;
  onAvatarChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAvatarClear: () => void;
  onSelectCommunity: (community: Community) => void;
  onJoin: () => void;
  onSaveNew: () => void;
  onStartEdit: () => void;
  onLeave: () => void;
  onDelete: () => void;
};

export const ProfileCommunityBlock = ({
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
  onSearchChange,
  onTitleChange,
  onLinkChange,
  onToggleCreateMode,
  onAvatarChange,
  onAvatarClear,
  onSelectCommunity,
  onJoin,
  onSaveNew,
  onStartEdit,
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
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <IconPeople />
              )}
            </div>
            <div className={stls.communitySelectedMeta}>
              <div className={stls.communitySelectedTitleRow}>
                <div className={stls.communitySelectedTitle}>{community.title}</div>
                {isCreator && (
                  <span className={stls.communityOwnerBadge}>Вы создатель</span>
                )}
              </div>
              <div className={stls.communitySelectedLink}>{community.tg_link}</div>
            </div>
          </div>
          <OpenableCommunityBadge
            className={stls.communityBadgeFullWidth}
            title={community.title}
            avatarUrl={community.avatar_url}
            tgLink={community.tg_link}
            communityId={community.id}
            memberCount={community.member_count}
          />
        </div>
        <div className={stls.communityActions}>
          {isCreator ? (
            <>
              <Button
                size="medium"
                variant="secondary"
                loading={isSaving}
                onClick={onStartEdit}
              >
                Редактировать
              </Button>
              <Button
                size="medium"
                variant="secondary"
                loading={isSaving}
                onClick={onDelete}
              >
                Удалить сообщество
              </Button>
            </>
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
        <OpenableCommunityBadge
          className={stls.communityBadgeFullWidth}
          title={selectedPreview.title ?? titleValue}
          avatarUrl={avatarPreviewUrl ?? avatarValue}
          tgLink={selectedPreview.tg_link ?? linkValue}
          communityId={selectedPreview.id}
          memberCount={selectedPreview.member_count}
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
                        decoding="async"
                        referrerPolicy="no-referrer"
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
          <div className={placeStls.section}>
            <h4 className={placeStls.sectionTitle}>Фото</h4>
            <div
              className={placeStls.photoGrid}
              style={{
                gridTemplateColumns: "minmax(0, 220px)",
                justifyItems: "stretch",
              }}
            >
              {avatarPreviewUrl || avatarValue.trim() ? (
                <div className={placeStls.photoSlotWrap}>
                  <button
                    type="button"
                    className={placeStls.photoSlotPick}
                    onClick={() =>
                      document
                        .getElementById(COMMUNITY_AVATAR_PHOTO_INPUT_ID)
                        ?.click()
                    }
                    aria-label="Заменить фото сообщества"
                  >
                    <div className={placeStls.photoCard}>
                      <img
                        src={avatarPreviewUrl ?? avatarValue}
                        alt="Аватар сообщества"
                        decoding="async"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </button>
                  <button
                    type="button"
                    className={placeStls.photoRemove}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAvatarClear();
                    }}
                    aria-label="Удалить фото"
                    title="Удалить фото"
                  >
                    <IconDelete
                      className={placeStls.photoRemoveIcon}
                      color="currentColor"
                    />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={placeStls.photoAdd}
                  onClick={() =>
                    document
                      .getElementById(COMMUNITY_AVATAR_PHOTO_INPUT_ID)
                      ?.click()
                  }
                >
                  Добавить фото
                </button>
              )}
            </div>
            <input
              id={COMMUNITY_AVATAR_PHOTO_INPUT_ID}
              ref={communityAvatarInputRef}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              style={{ display: "none" }}
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
              {isEditingMode ? "Сохранить изменения" : "Сохранить сообщество"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
