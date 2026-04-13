import cn from "classnames";
import Skeleton from "@mui/material/Skeleton";
import {
  IconAvatar,
  IconEdit,
  IconFirstAid,
  IconRight,
  IconTrophyOutlined,
} from "../../shared/icons";
import { IconVerification } from "../../shared/icons/IconVerification";
import { IconButton } from "../../shared/ui";
import type { Community, SibaStatus, ShibaType } from "../../shared/types";
import {
  getSibaStatusColor,
  isGreenStatus,
} from "../../shared/utils/siba-status";
import { ProfileRoleLore } from "./profile-role-lore";
import { ProfileStatsGrid } from "./profile-stats-grid";
import { ProfileStatusControl } from "./profile-status-control";
import stls from "./profile.module.sass";

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
  onOpenFilePicker: () => void;
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
  onOpenFilePicker,
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
        <div className={stls.photoWrapper} onClick={onOpenFilePicker}>
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
              src={mySiba.photos}
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
            onChange={onPhotoChange}
          />
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
                <a
                  className={stls.communityPanelTitle}
                  href={communityLink ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                >
                  {communityTitle}
                </a>
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
