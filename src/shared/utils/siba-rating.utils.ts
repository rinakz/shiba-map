import type { ShibaType } from "../types";
import {
  SIBA_RATING_POINTS_PER_COMMAND,
  SIBA_RATING_POINTS_PER_PLACE_ADDED,
  SIBA_RATING_POINTS_PER_VISIT,
} from "../constants/siba-rating";

export type SibaRatingOverrides = {
  /** Если в строке маркера ещё нет `owner_places_count` (старая схема). */
  ownerPlacesCount?: number;
  /** Если в строке нет `academy_commands_count` — передать из запроса академии. */
  commandsLearned?: number;
};

/**
 * Рейтинг сибы: добавленные на карту места (по владельцу) + чекины + выученные команды.
 * Веса как в БД: 20 / 10 / 25 за единицу.
 */
export function computeSibaRatingScore(
  siba: Partial<ShibaType> | undefined | null,
  overrides?: SibaRatingOverrides,
): number {
  if (!siba) return 0;
  const places =
    overrides?.ownerPlacesCount ?? siba.owner_places_count ?? 0;
  const visits =
    (siba.cafe ?? 0) + (siba.park ?? 0) + (siba.groomer ?? 0);
  const commands =
    overrides?.commandsLearned ?? siba.academy_commands_count ?? 0;
  return (
    places * SIBA_RATING_POINTS_PER_PLACE_ADDED +
    visits * SIBA_RATING_POINTS_PER_VISIT +
    commands * SIBA_RATING_POINTS_PER_COMMAND
  );
}

export function sibaRatingVisitTotal(siba: Pick<ShibaType, "cafe" | "park" | "groomer"> | undefined): number {
  if (!siba) return 0;
  return (siba.cafe ?? 0) + (siba.park ?? 0) + (siba.groomer ?? 0);
}
