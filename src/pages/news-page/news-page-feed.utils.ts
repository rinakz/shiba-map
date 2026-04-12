import type { FeedItem } from "../../shared/header/news-panel/news-panel.types";

export type GroupedFeedEntry =
  | { type: "single"; item: FeedItem }
  | { type: "subscription_group"; items: FeedItem[] }
  | { type: "visit_group"; items: FeedItem[] };

function sameSubscriptionCluster(a: FeedItem, b: FeedItem) {
  return (
    !a.isExpertPost &&
    !b.isExpertPost &&
    a.actorSibaId === b.actorSibaId &&
    a.verb === "подписался на" &&
    b.verb === "подписался на" &&
    Boolean(a.targetSiba && b.targetSiba)
  );
}

function sameVisitCluster(a: FeedItem, b: FeedItem) {
  return (
    !a.isExpertPost &&
    !b.isExpertPost &&
    a.actorSibaId === b.actorSibaId &&
    a.verb === "сегодня посетил" &&
    b.verb === "сегодня посетил" &&
    Boolean(a.place && b.place)
  );
}

/** Склеивает подряд идущие в ленте однотипные события одного актёра */
export function buildGroupedFeedEntries(items: FeedItem[]): GroupedFeedEntry[] {
  const out: GroupedFeedEntry[] = [];
  let i = 0;
  while (i < items.length) {
    const cur = items[i];
    if (cur.isExpertPost) {
      out.push({ type: "single", item: cur });
      i += 1;
      continue;
    }
    if (cur.verb === "подписался на" && cur.targetSiba) {
      const group = [cur];
      let j = i + 1;
      while (j < items.length && sameSubscriptionCluster(group[0], items[j])) {
        group.push(items[j]);
        j += 1;
      }
      if (group.length >= 2) {
        out.push({ type: "subscription_group", items: group });
        i = j;
        continue;
      }
    }
    if (cur.verb === "сегодня посетил" && cur.place) {
      const group = [cur];
      let j = i + 1;
      while (j < items.length && sameVisitCluster(group[0], items[j])) {
        group.push(items[j]);
        j += 1;
      }
      if (group.length >= 2) {
        out.push({ type: "visit_group", items: group });
        i = j;
        continue;
      }
    }
    out.push({ type: "single", item: cur });
    i += 1;
  }
  return out;
}

export function pluralRuUsersMore(n: number): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return "пользователей";
  if (d === 1) return "пользователя";
  if (d >= 2 && d <= 4) return "пользователя";
  return "пользователей";
}

export function pluralRuPlacesMore(n: number): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  if (abs > 10 && abs < 20) return "мест";
  if (d === 1) return "место";
  if (d >= 2 && d <= 4) return "места";
  return "мест";
}

export function groupedEntryLikeIds(entry: GroupedFeedEntry): string[] {
  if (entry.type === "single") return [entry.item.id];
  return entry.items.map((x) => x.id);
}

export function groupedEntryReactKey(entry: GroupedFeedEntry): string {
  if (entry.type === "single") return entry.item.id;
  const ids = entry.items.map((x) => x.id).join("|");
  return `grp:${entry.type}:${ids}`;
}

export type NewsLikeRow = { item_id: string; user_id: string };

/** Одна карточка — число строк лайков; группа — число уникальных пользователей (без двойного счёта). */
export function newsLikesMainQueryKey(feedItems: FeedItem[]) {
  return ["news-likes", feedItems.map((i) => i.id).join(",")] as const;
}

export function countLikesForFeedEntry(
  itemIds: string[],
  rows: NewsLikeRow[] | undefined,
): number {
  const list = rows ?? [];
  if (itemIds.length <= 1) {
    const id = itemIds[0];
    if (!id) return 0;
    return list.filter((r) => r.item_id === id).length;
  }
  const users = new Set<string>();
  for (const r of list) {
    if (itemIds.includes(r.item_id)) users.add(r.user_id);
  }
  return users.size;
}
