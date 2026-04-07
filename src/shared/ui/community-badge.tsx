import stls from "./community-badge.module.sass";

type Props = {
  title?: string | null;
  avatarUrl?: string | null;
  tgLink?: string | null;
};

export const CommunityBadge = ({ title, avatarUrl, tgLink }: Props) => {
  if (!title) return null;

  const content = (
    <>
      {avatarUrl ? (
        <img className={stls.avatar} src={avatarUrl} alt={title} />
      ) : (
        <span className={stls.avatar} />
      )}
      <span className={stls.title}>{title}</span>
    </>
  );

  if (tgLink) {
    return (
      <a className={stls.badge} href={tgLink} target="_blank" rel="noreferrer">
        {content}
      </a>
    );
  }

  return <span className={stls.badge}>{content}</span>;
};
