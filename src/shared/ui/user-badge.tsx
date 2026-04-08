import { CommunityBadge } from "./community-badge";
import stls from "./user-badge.module.sass";

type ChatData = {
  title?: string | null;
  slug?: string | null;
  avatarUrl?: string | null;
  tgLink?: string | null;
  color?: string | null;
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
        <CommunityBadge
          title={chatData.title}
          slug={chatData.slug}
          avatarUrl={chatData.avatarUrl}
          tgLink={chatData.tgLink}
          color={chatData.color}
        />
      )}
    </span>
  );
};
