import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  canVisitPlaceAgain,
  fetchPlaceRatingSummary,
  fetchPlaceVisits,
  getNextPlaceVisitAt,
  savePlaceRating,
  savePlaceVisit,
} from "./general-map.utils";
import type {
  Place,
  PlaceKind,
  PlaceRatingSummary,
  PlaceVisit,
} from "./place-types";
import { Button } from "../../shared/ui";
import {
  Dialog,
  Skeleton,
  SwipeableDrawer,
  useMediaQuery,
} from "@mui/material";
import { Siba } from "../siba/siba";
import { IconCrown } from "../../shared/icons/IconCrown";
import { IconStar } from "../../shared/icons/IconStar";
import {
  geocodeAddressFromCoords,
  type YMapGeocodeApi,
} from "../../shared/api/ymaps-geocode";
import stls from "./place-sheet.module.sass";
import { AppContext } from "../../shared/context/app-context";

type PlaceDetailProps = {
  kind: PlaceKind;
  place: Place;
};

export const PlaceDetail = ({ kind, place }: PlaceDetailProps) => {
  const { authUserId, mySiba, setMySiba } = useContext(AppContext);
  const queryClient = useQueryClient();
  const [showAll, setShowAll] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string>(place.address);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [optimisticRating, setOptimisticRating] = useState<number | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [visitError, setVisitError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width:600px)");
  const visitsQuery = useQuery<PlaceVisit[]>({
    queryKey: ["place-visits", kind, place.id],
    queryFn: () => fetchPlaceVisits(kind, place.id),
  });
  const ratingQuery = useQuery<PlaceRatingSummary>({
    queryKey: ["place-rating", kind, place.id, authUserId],
    queryFn: () => fetchPlaceRatingSummary(kind, place.id, authUserId),
  });
  const ratePlaceMutation = useMutation({
    mutationFn: async (value: number) => {
      if (!authUserId) {
        throw new Error("Нужно войти, чтобы поставить оценку.");
      }
      await savePlaceRating(kind, place.id, authUserId, value);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["place-rating", kind, place.id],
      });
    },
  });

  const visits = visitsQuery.data ?? [];
  const uniqueVisitors = useMemo(() => {
    const bySiba = new Map<string, PlaceVisit>();
    visits.forEach((visit) => {
      if (!bySiba.has(visit.siba_id)) {
        bySiba.set(visit.siba_id, visit);
      }
    });
    return Array.from(bySiba.values());
  }, [visits]);

  const visitCounts = useMemo(() => {
    const counts = new Map<string, number>();
    visits.forEach((visit) => {
      counts.set(visit.siba_id, (counts.get(visit.siba_id) ?? 0) + 1);
    });
    return counts;
  }, [visits]);

  const mayor = useMemo(() => {
    return (
      uniqueVisitors
        .map((visit) => ({
          visit,
          count: visitCounts.get(visit.siba_id) ?? 0,
        }))
        .sort((a, b) => b.count - a.count)[0] ?? null
    );
  }, [uniqueVisitors, visitCounts]);

  const visitorsPreview = useMemo(() => {
    if (!uniqueVisitors.length) return [];
    if (!mayor) return uniqueVisitors.slice(0, 3);
    const rest = uniqueVisitors.filter(
      (visit) => visit.siba_id !== mayor.visit.siba_id,
    );
    return [mayor.visit, ...rest].slice(0, 3);
  }, [mayor, uniqueVisitors]);

  const extraVisitorsCount = Math.max(
    uniqueVisitors.length - visitorsPreview.length,
    0,
  );
  const placeImages = (place.photos ?? []).filter(Boolean);
  const coverImage = place.photo ?? placeImages[0] ?? null;
  const rating = ratingQuery.data?.average ?? null;
  const myRating = ratingQuery.data?.myRating ?? null;
  const totalRatings = ratingQuery.data?.total ?? 0;
  const effectiveMyRating = optimisticRating ?? myRating;
  const previewRating = hoveredRating ?? effectiveMyRating ?? 0;
  const latestMyVisit = useMemo(() => {
    if (!mySiba?.id) return null;
    return visits.find((visit) => visit.siba_id === mySiba.id) ?? null;
  }, [mySiba?.id, visits]);
  const canVisitNow = canVisitPlaceAgain(latestMyVisit?.visited_at ?? null);
  const nextVisitAt = getNextPlaceVisitAt(latestMyVisit?.visited_at ?? null);

  const handleCopyPromo = async () => {
    if (!place.promo_code) return;
    try {
      await navigator.clipboard.writeText(place.promo_code);
    } catch {
      // noop
    }
  };

  const kindLabel =
    kind === "cafe"
      ? "Кафе для сибика"
      : kind === "park"
        ? "Парк для прогулок"
        : "Груминг-точка";

  const handleRate = async (value: number) => {
    const previousRating = effectiveMyRating ?? null;
    setRatingError(null);
    setOptimisticRating(value);
    try {
      await ratePlaceMutation.mutateAsync(value);
      setOptimisticRating(null);
    } catch (error) {
      setOptimisticRating(previousRating);
      setRatingError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить оценку. Попробуй ещё раз.",
      );
    }
  };

  const visitPlaceMutation = useMutation({
    mutationFn: async () => {
      await savePlaceVisit({
        kind,
        placeId: place.id,
        authUserId,
        mySiba,
        setMySiba,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["place-visits", kind, place.id],
      });
    },
  });

  const handleVisitPlace = async () => {
    setVisitError(null);
    try {
      await visitPlaceMutation.mutateAsync();
    } catch (error) {
      setVisitError(
        error instanceof Error
          ? error.message
          : "Не удалось сохранить посещение. Попробуй ещё раз.",
      );
    }
  };

  const tryParseCoordsFromAddress = (
    value: string,
  ): [number, number] | null => {
    const trimmed = value.trim();
    if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed) || parsed.length < 2) return null;
      const lat = Number(parsed[0]);
      const lng = Number(parsed[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return [lat, lng];
    } catch {
      return null;
    }
  };

  const formatCoords = (coords: [number, number]) =>
    `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;

  const addressCoords = useMemo(
    () => tryParseCoordsFromAddress(place.address),
    [place.address],
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!addressCoords) {
        setResolvedAddress(place.address);
        return;
      }
      const ymaps = (window as unknown as { ymaps?: YMapGeocodeApi }).ymaps;
      if (!ymaps) {
        setResolvedAddress(formatCoords(addressCoords));
        return;
      }
      setIsResolvingAddress(true);
      try {
        const backwardAddr = await geocodeAddressFromCoords(
          ymaps,
          addressCoords,
        );
        if (!cancelled) {
          setResolvedAddress(backwardAddr ?? formatCoords(addressCoords));
        }
      } catch {
        if (!cancelled) setResolvedAddress(formatCoords(addressCoords));
      } finally {
        if (!cancelled) setIsResolvingAddress(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [addressCoords, place.address]);

  return (
    <div className={stls.sheet}>
      <div className={stls.sheetHandle} />
      <div className={stls.sheetHero}>
        <div className={stls.sheetHeader}>
          <div className={stls.sheetHeaderMain}>
            <span className={stls.kindBadge}>
              {kind === "cafe" ? "☕" : kind === "park" ? "🌳" : "✂️"}{" "}
              {kindLabel}
            </span>
            <h3 className={stls.sheetTitle}>{place.name}</h3>
            <div className={stls.sheetSubtitle}>
              {isResolvingAddress ? "Определяем адрес..." : resolvedAddress}
            </div>
          </div>
          <div className={stls.ratingBadge}>
            <span className={stls.ratingBadgeIcon}>
              <IconStar />
            </span>
            {rating ? rating.toFixed(1) : "—"}
          </div>
        </div>

        {coverImage && (
          <img className={stls.heroImage} src={coverImage} alt={place.name} />
        )}

        {placeImages.length > 1 && (
          <div className={stls.photoGrid}>
            {placeImages.slice(0, 3).map((photo) => (
              <div key={photo} className={stls.photoCard}>
                <img src={photo} alt={place.name} />
              </div>
            ))}
          </div>
        )}
      </div>

      {kind === "cafe" && place.promo_code && (
        <div className={stls.section}>
          <h4 className={stls.sectionTitle}>Промокод для сибиков</h4>
          <div className={stls.ticket}>
            <div className={stls.ticketContent}>
              <span className={stls.ticketLabel}>
                Покажи нос официанту и назови код
              </span>
              <span className={stls.ticketCode}>{place.promo_code}</span>
            </div>
            <Button
              size="small"
              className={stls.copyButton}
              onClick={handleCopyPromo}
            >
              Копировать
            </Button>
          </div>
        </div>
      )}

      <div className={stls.section}>
        <h4 className={stls.sectionTitle}>Оценка сибика</h4>
        <div className={stls.ratingPanel}>
          <div className={stls.ratingStars}>
            {[1, 2, 3, 4, 5].map((value) => {
              const active = previewRating >= value;
              return (
                <button
                  key={`rate-${value}`}
                  type="button"
                  className={`${stls.ratingStarButton} ${active ? stls.ratingStarButtonActive : ""}`}
                  onClick={() => handleRate(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(null)}
                  onFocus={() => setHoveredRating(value)}
                  onBlur={() => setHoveredRating(null)}
                  disabled={ratePlaceMutation.isPending}
                  aria-pressed={Boolean(myRating && myRating >= value)}
                  aria-label={`Поставить оценку ${value} из 5`}
                >
                  <IconStar />
                </button>
              );
            })}
          </div>
          <div className={stls.ratingMeta}>
            {ratePlaceMutation.isPending
              ? "Сохраняем вашу оценку..."
              : ratingQuery.isLoading
                ? "Считаем оценки..."
                : totalRatings
                  ? `${rating?.toFixed(1) ?? "—"} из 5 • ${totalRatings} оценок`
                  : "Пока нет оценок"}
          </div>
          <div className={stls.ratingHint}>
            {ratePlaceMutation.isPending
              ? "Подождите, сохраняем ваш выбор"
              : effectiveMyRating
                ? `Ваша оценка: ${effectiveMyRating} из 5`
                : "Нажми на звездочку, чтобы поставить свою оценку"}
          </div>
          {ratingError && <div className={stls.error}>{ratingError}</div>}
        </div>
      </div>

      <div className={stls.section}>
        <h4 className={stls.sectionTitle}>О месте</h4>
        <p className={stls.sectionText}>
          {place.description ??
            (kind === "cafe"
              ? "Дог-френдли место для перекуса после прогулки. Можно зайти с сибиком и отдохнуть."
              : kind === "park"
                ? "Уютное место для длинных прогулок, знакомств и тренировок с хвостатыми."
                : "Точка, где можно привести шерсть и бублик в идеальный порядок.")}
        </p>
      </div>

      <div className={stls.section}>
        <h4 className={stls.sectionTitle}>Отметиться в месте</h4>
        <div className={stls.visitActionCard}>
          {canVisitNow ? (
            <>
              <p className={stls.sectionText}>
                Отметься, чтобы попасть в список посетителей и побороться за звание мэра.
              </p>
              <Button
                size="small"
                className={stls.visitButton}
                onClick={handleVisitPlace}
                loading={visitPlaceMutation.isPending}
                disabled={visitPlaceMutation.isPending || !authUserId}
              >
                Посетить
              </Button>
            </>
          ) : (
            <p className={stls.sectionText}>
              Ты уже отметил это место.
              {nextVisitAt
                ? ` Снова можно посетить ${nextVisitAt.toLocaleString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}.`
                : ""}
            </p>
          )}
          {visitError && <div className={stls.error}>{visitError}</div>}
        </div>
      </div>

      {mayor && (
        <div className={stls.mayorCard}>
          <span className={stls.mayorCrown}>
            <IconCrown />
          </span>
          <span>
            <b>{mayor.visit.siba_name ?? "Сиба"}</b> — мэр{" "}
            {kind === "park"
              ? "этого парка"
              : kind === "cafe"
                ? "этого кафе"
                : "этого места"}
            . Был здесь {mayor.count} раз.
          </span>
        </div>
      )}

      <div className={stls.section}>
        {uniqueVisitors.length ? (
          <h4 className={stls.sectionTitle}>
            Тут гуляли ({uniqueVisitors.length})
          </h4>
        ) : (
          <h4 className={stls.sectionTitle}>Тут ещё не гуляли</h4>
        )}
        {visitsQuery.isLoading ? (
          <>
            <Skeleton variant="rounded" height={64} />
            <Skeleton variant="rounded" height={56} />
          </>
        ) : uniqueVisitors.length ? (
          <>
            <div className={stls.avatarRow}>
              {visitorsPreview.map((visit) => {
                const isMayor = mayor?.visit.siba_id === visit.siba_id;
                return (
                  <button
                    key={`preview-${visit.siba_id}`}
                    type="button"
                    className={stls.visitorChip}
                    onClick={() => setSelectedSibaId(visit.siba_id)}
                  >
                    <span className={stls.visitorAvatarWrap}>
                      {isMayor && (
                        <span className={stls.visitorCrown}>
                          <IconCrown size={18} />
                        </span>
                      )}
                      <img
                        className={stls.visitorAvatar}
                        src={
                          visit.siba_photo ??
                          `/${visit.siba_icon ?? "default"}.png`
                        }
                        alt={visit.siba_name ?? "Сиба"}
                      />
                    </span>
                    <span className={stls.visitorName}>
                      {visit.siba_name ?? "Сиба"}
                    </span>
                  </button>
                );
              })}
              {extraVisitorsCount > 0 && (
                <div className={stls.visitorMore}>+{extraVisitorsCount}</div>
              )}
            </div>

            {(showAll ? visits : visits.slice(0, 4)).length > 0 && (
              <div className={stls.visitList}>
                {(showAll ? visits : visits.slice(0, 4)).map((visit) => (
                  <button
                    key={visit.id}
                    type="button"
                    className={stls.visitRow}
                    onClick={() => setSelectedSibaId(visit.siba_id)}
                  >
                    <img
                      className={stls.visitorAvatar}
                      src={
                        visit.siba_photo ??
                        `/${visit.siba_icon ?? "default"}.png`
                      }
                      alt={visit.siba_name ?? "Сиба"}
                    />
                    <span className={stls.visitMeta}>
                      <span className={stls.visitName}>
                        {visit.siba_name ?? "Сиба"}
                      </span>
                      <span className={stls.visitDate}>
                        {new Date(visit.visited_at).toLocaleDateString("ru-RU")}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {visits.length > 4 && !showAll && (
              <Button size="small" onClick={() => setShowAll(true)}>
                Показать ещё
              </Button>
            )}
          </>
        ) : (
          <p className={stls.sectionText}>
            Пока никто из сибиков не отмечался в этом месте.
          </p>
        )}
      </div>

      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={Boolean(selectedSibaId)}
          onOpen={() => {}}
          onClose={() => setSelectedSibaId(null)}
          PaperProps={{
            sx: {
              height: "auto",
              maxHeight: "90dvh",
              padding: "12px",
              overflowY: "auto",
              overscrollBehavior: "contain",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={Boolean(selectedSibaId)}
          onClose={() => setSelectedSibaId(null)}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxHeight: "90dvh",
              overflowY: "auto",
              padding: "12px",
            },
          }}
        >
          {selectedSibaId && <Siba id={selectedSibaId} />}
        </Dialog>
      )}
    </div>
  );
};
