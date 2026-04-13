import { useContext } from "react";
import { CommunityPreviewDrawerContext } from "../context/community-preview-drawer-react-context";
import { CommunityBadge } from "./community-badge";

type Props = {
  title: string;
  avatarUrl?: string | null;
  tgLink?: string | null;
  communityId?: string | null;
  memberCount?: number;
  className?: string;
  color?: string | null;
};

/**
 * Открывает превью сообщества в общем drawer; без провайдера ведёт себя как ссылка на внешний чат.
 */
export const OpenableCommunityBadge = ({
  title,
  avatarUrl,
  tgLink,
  communityId,
  memberCount,
  className,
  color,
}: Props) => {
  const drawer = useContext(CommunityPreviewDrawerContext);

  if (!drawer) {
    return (
      <CommunityBadge
        title={title}
        avatarUrl={avatarUrl}
        tgLink={tgLink}
        className={className}
        color={color}
      />
    );
  }

  return (
    <CommunityBadge
      title={title}
      avatarUrl={avatarUrl}
      className={className}
      color={color}
      onClick={() =>
        drawer.openCommunityPreview({
          title,
          avatarUrl: avatarUrl ?? null,
          externalLink: tgLink ?? null,
          communityId: communityId ?? null,
          ...(typeof memberCount === "number" ? { memberCount } : {}),
        })
      }
    />
  );
};
