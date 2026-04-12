import { formatFeedTimeAgo } from "../../shared/header/news-panel/news-panel.utils";
import { UserBadge } from "../../shared/ui/user-badge";
import { IconPaw } from "../../shared/icons/IconPaw";
import { IconHouse } from "../../shared/icons/IconHouse";
import { IconGraduationCap } from "../../shared/icons/IconGraduationCap";
import type { Place, PlaceKind } from "../../feature/map/place-types";
import {
  placeIconHrefByKind,
  placeMarkerAccentByKind,
} from "../../feature/map/general-map.utils";
import {
  type GroupedFeedEntry,
  type NewsLikeRow,
  countLikesForFeedEntry,
  groupedEntryLikeIds,
  groupedEntryReactKey,
  pluralRuPlacesMore,
  pluralRuUsersMore,
} from "./news-page-feed.utils";
import { NEWS_BREEDER_FEED_ACCENT } from "./news-page.constants";
import { getNewsActivityMeta } from "./news-page.ui";
import pageStls from "./news-page.module.sass";

type Props = {
  entries: GroupedFeedEntry[];
  likesRows: NewsLikeRow[] | undefined;
  myLikesSet: Set<string>;
  onToggleLike: (itemIds: string[]) => void;
  onOpenLikesSheet: (itemIds: string[]) => void;
  onOpenSubscriptionGroup: (
    entry: Extract<GroupedFeedEntry, { type: "subscription_group" }>,
  ) => void;
  onOpenVisitGroup: (
    entry: Extract<GroupedFeedEntry, { type: "visit_group" }>,
  ) => void;
  onSelectActorSiba: (sibaId: string) => void;
  onSelectTargetSiba: (sibaId: string) => void;
  onSelectPlace: (kind: PlaceKind, place: Place) => void;
};

export const NewsFeedEntries = ({
  entries,
  likesRows,
  myLikesSet,
  onToggleLike,
  onOpenLikesSheet,
  onOpenSubscriptionGroup,
  onOpenVisitGroup,
  onSelectActorSiba,
  onSelectTargetSiba,
  onSelectPlace,
}: Props) => {
  return (
    <>
      {entries.map((entry) => {
        const likeIds = groupedEntryLikeIds(entry);
        const groupKey = groupedEntryReactKey(entry);
        const aggregateLikes = countLikesForFeedEntry(likeIds, likesRows);
        const liked = likeIds.some((id) => myLikesSet.has(id));

        const likeRow = (
          <div className={pageStls.feedActions}>
            <button
              type="button"
              onClick={() => onToggleLike(likeIds)}
              className={`${pageStls.likeButton} ${
                liked ? pageStls.likeButtonActive : ""
              }`}
              title={liked ? "Убрать лайк" : "Нравится"}
            >
              <IconPaw size={22} color={liked ? "#E95B47" : "#A3A19E"} />
            </button>
            <button
              type="button"
              className={`${pageStls.likesCount} ${
                liked ? pageStls.likesCountActive : ""
              }`}
              onClick={() => onOpenLikesSheet(likeIds)}
              title="Кто лайкнул"
            >
              {aggregateLikes}
            </button>
          </div>
        );

        if (entry.type === "subscription_group") {
          const first = entry.items[0];
          const extras = entry.items.length - 1;
          const tgt = first.targetSiba;
          if (!tgt) return null;
          return (
            <article key={groupKey} className={pageStls.feedCard}>
              <div className={pageStls.feedCardTop}>
                <button
                  type="button"
                  className={pageStls.feedAvatarButton}
                  onClick={() => onSelectActorSiba(first.actorSibaId)}
                >
                  <img
                    src={first.actorSibaAvatar}
                    alt={first.actorSibaName}
                    className={pageStls.feedAvatar}
                  />
                </button>
                <div className={pageStls.feedBody}>
                  <div className={pageStls.feedNameBlock}>
                    <button
                      type="button"
                      className={pageStls.feedActorButton}
                      onClick={() => onSelectActorSiba(first.actorSibaId)}
                    >
                      <UserBadge
                        userName={first.actorSibaName}
                        className={pageStls.feedActorWrap}
                        nameClassName={pageStls.feedActor}
                      />
                    </button>
                    <div className={pageStls.feedTimeBelow}>
                      {formatFeedTimeAgo(first.date)}
                    </div>
                  </div>
                  <div className={pageStls.feedContentRow}>
                    <div className={pageStls.feedEmojiBadge}>🤝</div>
                    <div className={pageStls.feedText}>
                      <span className={pageStls.feedVerb}>подписался на</span>{" "}
                      <button
                        type="button"
                        className={pageStls.feedTarget}
                        onClick={() => onSelectTargetSiba(tgt.id)}
                      >
                        {tgt.name}
                      </button>
                      {extras > 0 ? (
                        <>
                          {" "}
                          <button
                            type="button"
                            className={pageStls.feedGroupMoreLink}
                            onClick={() => onOpenSubscriptionGroup(entry)}
                          >
                            и ещё {extras} {pluralRuUsersMore(extras)}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {likeRow}
                </div>
              </div>
            </article>
          );
        }

        if (entry.type === "visit_group") {
          const first = entry.items[0];
          const extras = entry.items.length - 1;
          const pl = first.place;
          if (!pl) return null;
          return (
            <article key={groupKey} className={pageStls.feedCard}>
              <div className={pageStls.feedCardTop}>
                <button
                  type="button"
                  className={pageStls.feedAvatarButton}
                  onClick={() => onSelectActorSiba(first.actorSibaId)}
                >
                  <img
                    src={first.actorSibaAvatar}
                    alt={first.actorSibaName}
                    className={pageStls.feedAvatar}
                  />
                </button>
                <div className={pageStls.feedBody}>
                  <div className={pageStls.feedNameBlock}>
                    <button
                      type="button"
                      className={pageStls.feedActorButton}
                      onClick={() => onSelectActorSiba(first.actorSibaId)}
                    >
                      <UserBadge
                        userName={first.actorSibaName}
                        className={pageStls.feedActorWrap}
                        nameClassName={pageStls.feedActor}
                      />
                    </button>
                    <div className={pageStls.feedTimeBelow}>
                      {formatFeedTimeAgo(first.date)}
                    </div>
                  </div>
                  <div className={pageStls.feedContentRow}>
                    <div className={pageStls.feedPlaceIconWrap}>
                      <img
                        src={placeIconHrefByKind[pl.kind]}
                        alt=""
                        className={pageStls.feedPlaceBadgeImg}
                      />
                    </div>
                    <div className={pageStls.feedText}>
                      <span className={pageStls.feedVerb}>
                        сегодня посетил
                      </span>
                      <span className={pageStls.feedVerb}>:</span>{" "}
                      <button
                        type="button"
                        className={pageStls.feedPlaceButton}
                        style={{
                          color: placeMarkerAccentByKind[pl.kind],
                        }}
                        onClick={() => onSelectPlace(pl.kind, pl.place)}
                      >
                        {pl.place.name}
                      </button>
                      {extras > 0 ? (
                        <>
                          {" "}
                          <button
                            type="button"
                            className={pageStls.feedGroupMoreLink}
                            onClick={() => onOpenVisitGroup(entry)}
                          >
                            и ещё {extras} {pluralRuPlacesMore(extras)}
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                  {likeRow}
                </div>
              </div>
            </article>
          );
        }

        const item = entry.item;
        const activityMeta = getNewsActivityMeta(item);

        if (item.isExpertPost) {
          return (
            <article
              key={groupKey}
              className={`${pageStls.feedCard} ${pageStls.feedCardExpert}`}
            >
              <div className={pageStls.feedCardTop}>
                {item.actorSibaId ? (
                  <button
                    type="button"
                    className={pageStls.feedAvatarButton}
                    onClick={() => onSelectActorSiba(item.actorSibaId)}
                  >
                    <img
                      src={item.actorSibaAvatar}
                      alt={item.actorSibaName}
                      className={pageStls.feedAvatar}
                    />
                  </button>
                ) : (
                  <div className={pageStls.feedAvatarStatic}>
                    <img
                      src={item.actorSibaAvatar}
                      alt=""
                      className={pageStls.feedAvatar}
                    />
                  </div>
                )}
                <div className={pageStls.feedBody}>
                  <div className={pageStls.feedNameBlock}>
                    <div className={pageStls.feedNameRow}>
                      <span className={pageStls.feedActor}>
                        {item.actorSibaName}
                      </span>
                      <span
                        className={pageStls.expertHouseInline}
                        title="Заводчик"
                        aria-label="Заводчик"
                      >
                        <IconHouse size={16} color={NEWS_BREEDER_FEED_ACCENT} />
                      </span>
                    </div>
                    <div className={pageStls.feedTimeBelow}>
                      {formatFeedTimeAgo(item.date)}
                    </div>
                  </div>
                  {item.expertPostBody ? (
                    <p className={pageStls.expertPostBody}>
                      {item.expertPostBody}
                    </p>
                  ) : null}
                  {likeRow}
                </div>
              </div>
            </article>
          );
        }

        return (
          <article key={groupKey} className={pageStls.feedCard}>
            <div className={pageStls.feedCardTop}>
              <button
                type="button"
                className={pageStls.feedAvatarButton}
                onClick={() => onSelectActorSiba(item.actorSibaId)}
              >
                <img
                  src={item.actorSibaAvatar}
                  alt={item.actorSibaName}
                  className={pageStls.feedAvatar}
                />
              </button>
              <div className={pageStls.feedBody}>
                <div className={pageStls.feedNameBlock}>
                  <button
                    type="button"
                    className={pageStls.feedActorButton}
                    onClick={() => onSelectActorSiba(item.actorSibaId)}
                  >
                    <UserBadge
                      userName={item.actorSibaName}
                      className={pageStls.feedActorWrap}
                      nameClassName={pageStls.feedActor}
                    />
                  </button>
                  <div className={pageStls.feedTimeBelow}>
                    {formatFeedTimeAgo(item.date)}
                  </div>
                </div>
                <div className={pageStls.feedContentRow}>
                  <div
                    className={
                      item.place
                        ? pageStls.feedPlaceIconWrap
                        : item.commandName
                          ? pageStls.feedCommandIconWrap
                          : pageStls.feedEmojiBadge
                    }
                  >
                    {item.place ? (
                      <img
                        src={placeIconHrefByKind[item.place.kind]}
                        alt=""
                        className={pageStls.feedPlaceBadgeImg}
                      />
                    ) : item.commandName ? (
                      <IconGraduationCap size={16} color="#FFFCF5" />
                    ) : (
                      activityMeta.emoji
                    )}
                  </div>
                  <div className={pageStls.feedText}>
                    <span className={pageStls.feedVerb}>{item.verb}</span>{" "}
                    {item.targetSiba && (
                      <button
                        type="button"
                        className={pageStls.feedTarget}
                        onClick={() =>
                          onSelectTargetSiba(item.targetSiba!.id)
                        }
                      >
                        {item.targetSiba.name}
                      </button>
                    )}
                    {item.place && (
                      <>
                        <span className={pageStls.feedVerb}>:</span>{" "}
                        <button
                          type="button"
                          className={pageStls.feedPlaceButton}
                          style={{
                            color: placeMarkerAccentByKind[item.place.kind],
                          }}
                          onClick={() =>
                            onSelectPlace(item.place!.kind, item.place!.place)
                          }
                        >
                          {item.place.place.name}
                        </button>
                      </>
                    )}
                    {item.commandName && (
                      <span className={pageStls.feedCommand}>
                        {item.commandName}
                      </span>
                    )}
                  </div>
                </div>
                {likeRow}
              </div>
            </div>
          </article>
        );
      })}
    </>
  );
};
