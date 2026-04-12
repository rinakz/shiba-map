import type { FeedItem } from "../../shared/header/news-panel/news-panel.types";

export function getNewsActivityMeta(item: FeedItem): {
  emoji: string;
  accent: string;
  typeLabel: string;
} {
  if (item.isExpertPost) {
    return { emoji: "", accent: "", typeLabel: "питомник" };
  }
  if (item.commandName) {
    return { emoji: "", accent: item.commandName, typeLabel: "обучение" };
  }
  if (item.targetSiba) {
    return { emoji: "🤝", accent: item.targetSiba.name, typeLabel: "дружба" };
  }
  if (item.place?.place.name) {
    return { emoji: "", accent: item.place.place.name, typeLabel: "место" };
  }
  return { emoji: "🐾", accent: "", typeLabel: "событие" };
}
