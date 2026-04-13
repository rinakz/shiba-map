import cn from "classnames";
import Skeleton from "@mui/material/Skeleton";
import {
  IconDelete,
  IconEdit,
  IconFirstAid,
  IconRight,
  IconTrophyOutlined,
} from "../../shared/icons";
import { IconVerification } from "../../shared/icons/IconVerification";
import { IconButton, OpenableCommunityBadge } from "../../shared/ui";
import type { Community, SibaStatus, ShibaType } from "../../shared/types";
import {
  getSibaStatusColor,
  isGreenStatus,
} from "../../shared/utils/siba-status";
import { ProfileRoleLore } from "./profile-role-lore";
import { ProfileStatsGrid } from "./profile-stats-grid";
import { ProfileStatusControl } from "./profile-status-control";
import placeStls from "../../feature/map/place-sheet.module.sass";
import stls from "./profile.module.sass";

/** Как `place-form.tsx`: `id={`place-photo-${kind}`}` → стабильный id для `getElementById` */
export const PROFILE_AVATAR_PHOTO_INPUT_ID = "profile-avatar-photo";

type AcademyRank = {
  icon: string;
  rank: string;
  bossQuote: string;
} | null;

type ProfileHeaderCardProps = {
  authUserId: string | null;
  mySiba?: ShibaType;
  community: Community | null;
  isEdit: boolean;
  photoPreviewUrl: string | null;
  /** Локально сняли фото до сохранения — не показывать старое из mySiba. */
  profilePhotoClearedInEdit: boolean;
  onClearProfilePhoto: () => void;
  currentStatus: SibaStatus | null;
  academyRank: AcademyRank;
  subscriptionsCount: number;
  subscribersCount: number;
  isHealthLoading: boolean;
  hasHealthAlert: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onBack: () => void;
  onToggleCommunityManager: () => void;
  onOpenSubscriptions: () => void;
  onOpenSubscribers: () => void;
  onStartEdit: () => void;
  onOpenHealth: () => void;
  onOpenAcademy: () => void;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setMySiba: React.Dispatch<React.SetStateAction<ShibaType | undefined>>;
  setSibaIns: React.Dispatch<React.SetStateAction<ShibaType[]>>;
  breederMode?: boolean;
  breederVerified?: boolean;
  /** Название питомника из каталога kennels (не кличка сибы в sibains). */
  breederKennelName?: string | null;
};

export const ProfileHeaderCard = ({
  authUserId,
  mySiba,
  community,
  isEdit,
  photoPreviewUrl,
  profilePhotoClearedInEdit,
  onClearProfilePhoto,
  currentStatus,
  academyRank,
  subscriptionsCount,
  subscribersCount,
  isHealthLoading,
  hasHealthAlert,
  fileInputRef,
  onBack,
  onToggleCommunityManager,
  onOpenSubscriptions,
  onOpenSubscribers,
  onStartEdit,
  onOpenHealth,
  onOpenAcademy,
  onPhotoChange,
  setError,
  setMySiba,
  setSibaIns,
  breederMode = false,
  breederVerified = false,
  breederKennelName = null,
}: ProfileHeaderCardProps) => {
  const communityTitle = community?.title ?? mySiba?.community_title;
  const communityLink = community?.tg_link ?? mySiba?.community_tg_link;
  const communityAvatarUrl =
    community?.avatar_url ?? mySiba?.community_avatar_url ?? null;
  const profileEditPhotoSrc =
    photoPreviewUrl ??
    (!profilePhotoClearedInEdit ? (mySiba?.photos ?? null) : null);
  const genderLabel =
    mySiba?.siba_gender === "male" ? "♂" : "♀";
  const profileTitleName =
    breederMode && breederKennelName?.trim()
      ? breederKennelName.trim()
      : (mySiba?.siba_name ?? "");

  return (
    <div className={stls.sibaInfoContainer}>
      {!isEdit && (
        <div className={stls.topActionsRow}>
          <IconButton
            size="medium"
            variant="secondary"
            icon={
              <span className={stls.backIconWrap}>
                <IconRight />
              </span>
            }
            onClick={onBack}
          />
          <div className={stls.topActionsRight}>
            <IconButton
              size="medium"
              variant="secondary"
              icon={<span className={stls.topActionIcon}><IconEdit /></span>}
              onClick={onStartEdit}
            />
            {isHealthLoading ? (
              <Skeleton
                variant="rounded"
                width={42}
                height={42}
                className={stls.healthCardSkeleton}
              />
            ) : (
              <>
                <button
                  type="button"
                  className={stls.healthCardButton}
                  onClick={onOpenAcademy}
                  title="Академия Сиб"
                >
                  <span className={stls.healthCardIcon}>
                    <IconTrophyOutlined color="#E95B47" size={20} />
                  </span>
                </button>
                <button
                  type="button"
                  className={stls.healthCardButton}
                  onClick={onOpenHealth}
                  title={breederMode ? "Документы питомника" : "Медкнижка"}
                >
                  <span className={stls.healthCardIcon}>
                    <IconFirstAid color="#E95B47" />
                  </span>
                  {hasHealthAlert && !breederMode && (
                    <span className={stls.healthAlertDot}>!</span>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {isEdit ? (
        <div className={stls.centerRow}>
          <div className={placeStls.section}>
            <h4 className={placeStls.sectionTitle}>Фото</h4>
            <div
              className={placeStls.photoGrid}
              style={{
                gridTemplateColumns: "minmax(0, 220px)",
                justifyItems: "stretch",
              }}
            >
              {profileEditPhotoSrc ? (
                <div className={placeStls.photoSlotWrap}>
                  <button
                    type="button"
                    className={placeStls.photoSlotPick}
                    onClick={() =>
                      document
                        .getElementById(PROFILE_AVATAR_PHOTO_INPUT_ID)
                        ?.click()
                    }
                    aria-label="Заменить фото"
                  >
                    <div className={placeStls.photoCard}>
                      <img src={profileEditPhotoSrc} alt="Фото" />
                    </div>
                  </button>
                  <button
                    type="button"
                    className={placeStls.photoRemove}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearProfilePhoto();
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
                      .getElementById(PROFILE_AVATAR_PHOTO_INPUT_ID)
                      ?.click()
                  }
                >
                  Добавить фото
                </button>
              )}
            </div>
            <input
              id={PROFILE_AVATAR_PHOTO_INPUT_ID}
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onPhotoChange}
              style={{ display: "none" }}
            />
          </div>
        </div>
      ) : (
        <img
          className={cn(stls.sibaPhoto, {
            [stls.wantToWalk]: isGreenStatus(currentStatus),
            [stls.sibaPhotoPing]: isGreenStatus(currentStatus),
          })}
          style={{
            borderColor: currentStatus
              ? getSibaStatusColor(currentStatus)
              : "transparent",
          }}
          src={mySiba?.photos ?? `/${mySiba?.siba_icon}.png`}
          alt="Сиба"
        />
      )}
      <div className={stls.characterCard}>
        <div className={stls.titleRow}>
          <div className={stls.nameBlock}>
            <div className={stls.identityRow}>
              <h1 className={stls.sibaName}>{profileTitleName}</h1>
              {!breederMode ? (
                <span className={stls.genderBadge}>{genderLabel}</span>
              ) : null}
              {breederMode && breederVerified ? (
                <span className={stls.breederVerifiedBadge} title="Питомник верифицирован">
                  <IconVerification color="#FEAE11" size={18} />
                  Verified Breeder
                </span>
              ) : null}
            </div>
            {!breederMode ? (
              <ProfileStatusControl
                mySiba={mySiba}
                authUserId={authUserId}
                isEdit={isEdit}
                setError={setError}
                setMySiba={setMySiba}
                setSibaIns={setSibaIns}
              />
            ) : null}
            <div className={stls.communityPanel}>
              <div className={stls.communityPanelTop}>
                <span className={stls.communityPanelLabel}>Состоит в чате</span>
                <button
                  type="button"
                  className={stls.communityManageButton}
                  onClick={onToggleCommunityManager}
                >
                  {communityTitle ? "Управлять" : "+ Выбрать стаю"}
                </button>
              </div>
              {communityTitle ? (
                <OpenableCommunityBadge
                  className={stls.communityPanelBadge}
                  title={communityTitle}
                  avatarUrl={communityAvatarUrl}
                  tgLink={communityLink}
                  communityId={community?.id ?? mySiba?.community_id}
                  memberCount={community?.member_count}
                />
              ) : (
                <div className={stls.communityPanelEmpty}>
                  Пока не состоит ни в одной стае
                </div>
              )}
            </div>
          </div>
        </div>
        <ProfileStatsGrid
          mySiba={mySiba}
          subscriptionsCount={subscriptionsCount}
          subscribersCount={subscribersCount}
          onSubscriptionsClick={onOpenSubscriptions}
          onSubscribersClick={onOpenSubscribers}
        />
        {!breederMode && academyRank ? (
          <ProfileRoleLore
            rank={academyRank.rank}
            icon={academyRank.icon}
            quote={academyRank.bossQuote}
          />
        ) : null}
      </div>
    </div>
  );
};
