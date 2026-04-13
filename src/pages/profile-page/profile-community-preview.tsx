import { IconPeople } from "../../shared/icons";
import { OpenableCommunityBadge } from "../../shared/ui";
import type { Community, ShibaType } from "../../shared/types";
import stls from "./profile.module.sass";

type ProfileCommunityPreviewProps = {
  community: Community | null;
  mySiba?: ShibaType;
};

export const ProfileCommunityPreview = ({
  community,
  mySiba,
}: ProfileCommunityPreviewProps) => {
  const title = community?.title ?? mySiba?.community_title;
  const avatarUrl = community?.avatar_url ?? mySiba?.community_avatar_url;
  const tgLink = community?.tg_link ?? mySiba?.community_tg_link;

  if (!title) return null;

  return (
    <div className={stls.communityPreviewCard}>
      <div className={stls.communityPreviewHeader}>Сообщество</div>
      <div className={stls.communityPreviewBody}>
        <div className={stls.communityPreviewAvatar}>
          {avatarUrl ? (
            <img
              className={stls.communityPreviewAvatarImage}
              src={avatarUrl}
              alt={title}
            />
          ) : (
            <IconPeople />
          )}
        </div>
        <div className={stls.communityPreviewMeta}>
          <div className={stls.communityPreviewTitle}>{title}</div>
          <div className={stls.communityPreviewLink}>{tgLink}</div>
          <OpenableCommunityBadge
            title={title}
            avatarUrl={avatarUrl}
            tgLink={tgLink}
            communityId={community?.id ?? mySiba?.community_id}
            memberCount={community?.member_count}
          />
        </div>
      </div>
    </div>
  );
};
