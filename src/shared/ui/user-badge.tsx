import { OpenableCommunityBadge } from "./openable-community-badge";
import stls from "./user-badge.module.sass";

type ChatData = {
  title?: string | null;
  slug?: string | null;
  avatarUrl?: string | null;
  tgLink?: string | null;
  color?: string | null;
  communityId?: string | null;
  memberCount?: number;
};

type UserBadgeProps = {
  userName: string;
  chatData?: ChatData | null;
  nameClassName?: string;
  className?: string;
};

export const UserBadge = ({
  userName,
  chatData,
  nameClassName,
  className,
}: UserBadgeProps) => {
  return (
    <span className={`${stls.userBadge} ${className ?? ""}`}>
      <span className={`${stls.userName} ${nameClassName ?? ""}`}>{userName}</span>
      {chatData?.title && (
        <OpenableCommunityBadge
          title={chatData.title}
          avatarUrl={chatData.avatarUrl}
          tgLink={chatData.tgLink}
          color={chatData.color}
          communityId={chatData.communityId}
          memberCount={chatData.memberCount}
        />
      )}
    </span>
  );
};
