import type { CSSProperties } from "react";
import stls from "./community-badge.module.sass";

type Props = {
  title?: string | null;
  avatarUrl?: string | null;
  tgLink?: string | null;
  slug?: string | null;
  color?: string | null;
  className?: string;
  onClick?: () => void;
};

export const CommunityBadge = ({
  title,
  avatarUrl,
  tgLink,
  color,
  className,
  onClick,
}: Props) => {
  if (!title) return null;
  const label = title;

  const content = (
    <>
      {avatarUrl ? (
        <img className={stls.avatar} src={avatarUrl} alt={title} />
      ) : (
        <span className={stls.avatar} />
      )}
      <span className={stls.title}>{label}</span>
    </>
  );

  const style = color
    ? ({ ["--community-badge-color" as string]: color } as CSSProperties)
    : undefined;

  if (onClick) {
    return (
      <button
        type="button"
        className={`${stls.badge} ${className ?? ""}`}
        style={style}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  if (tgLink) {
    return (
      <a
        className={`${stls.badge} ${className ?? ""}`}
        href={tgLink}
        target="_blank"
        rel="noreferrer"
        style={style}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={`${stls.badge} ${className ?? ""}`} style={style}>
      {content}
    </span>
  );
};
