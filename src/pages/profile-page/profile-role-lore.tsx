import stls from "./profile.module.sass";

type ProfileRoleLoreProps = {
  rank?: string | null;
  icon?: string | null;
  quote?: string | null;
};

export const ProfileRoleLore = ({
  rank,
  icon,
  quote,
}: ProfileRoleLoreProps) => {
  const title = rank?.trim();
  const loreQuote = quote?.trim();

  return (
    <div className={stls.roleLoreSection}>
      <div className={stls.roleLoreCard}>
        <div className={stls.roleLoreTitle}>
          {icon?.trim()} {title}
        </div>
        <div className={stls.roleLoreQuote}>{loreQuote}</div>
      </div>
    </div>
  );
};
