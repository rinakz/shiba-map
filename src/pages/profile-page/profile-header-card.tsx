import cn from "classnames";
import Skeleton from "@mui/material/Skeleton";
import {
  IconAvatar,
  IconEdit,
  IconFirstAid,
  IconRight,
} from "../../shared/icons";
import { CommunityBadge, IconButton } from "../../shared/ui";
import type { Community, SibaStatus, ShibaType } from "../../shared/types";
import {
  getSibaStatusColor,
  isGreenStatus,
} from "../../shared/utils/siba-status";
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
  onStartEdit: () => void;
  onOpenHealth: () => void;
  onOpenFilePicker: () => void;
  onPhotoChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setMySiba: React.Dispatch<React.SetStateAction<ShibaType | undefined>>;
  setSibaIns: React.Dispatch<React.SetStateAction<ShibaType[]>>;
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
  onStartEdit,
  onOpenHealth,
  onOpenFilePicker,
  onPhotoChange,
  setError,
  setMySiba,
  setSibaIns,
}: ProfileHeaderCardProps) => {
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
              icon={<IconEdit />}
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
              <button
                type="button"
                className={stls.healthCardButton}
                onClick={onOpenHealth}
                title="Медкнижка"
              >
                <span className={stls.healthCardIcon}>
                  <IconFirstAid color="#E95B47" />
                </span>
                {hasHealthAlert && (
                  <span className={stls.healthAlertDot}>!</span>
                )}
              </button>
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
      <div className={stls.titleRow}>
        <div className={stls.nameBlock}>
          <h1 className={stls.sibaName}>{mySiba?.siba_name}</h1>
          <CommunityBadge
            title={community?.title ?? mySiba?.community_title}
            avatarUrl={community?.avatar_url ?? mySiba?.community_avatar_url}
            tgLink={community?.tg_link ?? mySiba?.community_tg_link}
          />
          <ProfileStatusControl
            mySiba={mySiba}
            authUserId={authUserId}
            isEdit={isEdit}
            setError={setError}
            setMySiba={setMySiba}
            setSibaIns={setSibaIns}
          />
        </div>
      </div>
      {!isEdit && academyRank && (
        <div className={stls.rankContainer}>
          <div className={stls.academyRankUnderName}>
            {academyRank.icon} {academyRank.rank}
          </div>
          <div className={stls.academyQuoteUnderName}>
            {academyRank.bossQuote}
          </div>
        </div>
      )}
      <div className={stls.statsRow}>
        <span className={stls.mutedText}>
          {mySiba?.siba_gender === "male" ? "Мальчик" : "Девочка"}
        </span>
        <span className={stls.mutedText}>level: {mySiba?.level ?? 0}</span>
      </div>
      <div className={stls.statsRow}>
        <span>Подписки: {subscriptionsCount}</span>
        <span>Подписчики: {subscribersCount}</span>
      </div>
    </div>
  );
};
