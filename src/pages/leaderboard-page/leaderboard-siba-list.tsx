import cn from "classnames";
import { UserBadge } from "../../shared/ui/user-badge";
import { IconCrown } from "../../shared/icons";
import { crownColorByPlace } from "./leaderboard-page.utils";
import { sibaLeaderboardStatusLine } from "./leaderboard-page.ui";
import type {
  LeaderboardSibaRow,
  SibaLeaderboardSubtitle,
} from "./leaderboard-page.types";
import stls from "./leaderboard-page.module.sass";

type Props = {
  rows: LeaderboardSibaRow[];
  subtitle: SibaLeaderboardSubtitle;
  onSelectSiba: (id: string) => void;
};

export const LeaderboardSibaList = ({
  rows,
  subtitle,
  onSelectSiba,
}: Props) => {
  return (
    <div className={stls.list}>
      {rows.map((item) => {
        const isTop = item.place <= 3;
        return (
          <button
            key={item.id}
            type="button"
            className={cn(
              stls.card,
              isTop && stls.cardTop,
              item.place === 1 && stls.cardTop1,
              item.place === 2 && stls.cardTop2,
              item.place === 3 && stls.cardTop3,
            )}
            onClick={() => onSelectSiba(item.id)}
          >
            <div className={stls.place}>{item.place}</div>
            <div className={stls.avatarWrap}>
              <img
                className={stls.avatar}
                src={item.photos ?? `/${item.siba_icon}.png`}
                alt={item.siba_name}
              />
            </div>
            <div className={stls.content}>
              <div className={stls.nameRow}>
                <UserBadge
                  userName={item.siba_name}
                  nameClassName={stls.name}
                  chatData={{
                    title: item.community_title,
                    avatarUrl: item.community_avatar_url,
                    tgLink: item.community_tg_link,
                    communityId: item.community_id,
                  }}
                />
                {item.place <= 3 && (
                  <span className={stls.crownCorner}>
                    <IconCrown color={crownColorByPlace(item.place)} />
                  </span>
                )}
              </div>
              <div className={stls.status}>
                {sibaLeaderboardStatusLine(item, subtitle)}
              </div>
            </div>
            <div className={stls.points}>
              <div className={stls.pointsLabelStack}>
                <div className={stls.pointsValue}>{item.level ?? 0}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
