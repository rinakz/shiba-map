import cn from "classnames";
import { IconCrown, IconTg } from "../../shared/icons";
import {
  LEADERBOARD_CHAT_AVATAR_FALLBACK_BG,
} from "./leaderboard-page.constants";
import type { CommunityRow } from "./leaderboard-page.types";
import { chatEnergyBarPercent, crownColorByPlace } from "./leaderboard-page.utils";
import stls from "./leaderboard-page.module.sass";

type Props = {
  chats: CommunityRow[];
  myCommunityId: string | null;
  authUserId: string | null | undefined;
  isBreederAccount: boolean;
  assigningCommunityId: string | null;
  onAssignCommunity: (communityId: string) => void | Promise<void>;
};

export const LeaderboardChatList = ({
  chats,
  myCommunityId,
  authUserId,
  isBreederAccount,
  assigningCommunityId,
  onAssignCommunity,
}: Props) => {
  const leaderEnergy = chats[0]?.energy ?? 1;

  return (
    <div className={stls.list}>
      {chats.map((chat, index) => {
        const place = index + 1;
        const progress = chatEnergyBarPercent(chat.energy, leaderEnergy);
        const isMyCommunity = Boolean(myCommunityId && chat.id === myCommunityId);
        const canAssign = Boolean(
          authUserId && !isBreederAccount && !myCommunityId,
        );
        return (
          <div
            key={chat.id}
            className={cn(stls.card, place <= 3 && stls.cardTop)}
          >
            <div className={stls.place}>{place}</div>
            <div className={stls.avatarWrap}>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: LEADERBOARD_CHAT_AVATAR_FALLBACK_BG,
                }}
              >
                {chat.avatarUrl ? (
                  <img
                    className={stls.avatar}
                    src={chat.avatarUrl}
                    alt={chat.title}
                  />
                ) : (
                  <IconTg />
                )}
              </div>
            </div>
            <div className={stls.content}>
              <div className={stls.nameRow}>
                <div className={stls.name}>{chat.title}</div>
                {place <= 3 && (
                  <span className={stls.crownCorner}>
                    <IconCrown color={crownColorByPlace(place)} />
                  </span>
                )}
              </div>
              <div className={stls.chatMeta}>
                {chat.participants} участников в приложении • {chat.energy}{" "}
                энергии
              </div>
              {chat.isLeader ? (
                <div className={stls.leaderBadge}>Лидирующий чат</div>
              ) : (
                <div className={stls.chatMeta}>
                  До лидера осталось: {chat.gapToLeader} очков
                </div>
              )}
              <div className={stls.energyBar}>
                <div
                  className={stls.energyFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            {isMyCommunity ? (
              <span className={stls.chatActionMuted}>Мой чат</span>
            ) : canAssign ? (
              <button
                type="button"
                className={stls.chatAction}
                onClick={() => void onAssignCommunity(chat.id)}
                disabled={assigningCommunityId === chat.id}
              >
                {assigningCommunityId === chat.id
                  ? "Сохраняем..."
                  : "Это мой чат"}
              </button>
            ) : (
              <a
                className={stls.chatAction}
                href={chat.tgLink}
                target="_blank"
                rel="noreferrer"
              >
                Вступить
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};
