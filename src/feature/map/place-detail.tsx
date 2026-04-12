import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useMemo, useState } from "react";
import {
  canVisitPlaceAgain,
  fetchPlaceRatingSummary,
  fetchPlaceVisits,
  getNextPlaceVisitAt,
  savePlaceRating,
  savePlaceVisit,
} from "./general-map.utils";
import type { Place, PlaceKind } from "./place-types";
import { useMediaQuery } from "@mui/material";
import stls from "./place-sheet.module.sass";
import { AppContext } from "../../shared/context/app-context";
import { PlaceDetailAbout } from "./place-detail/place-detail-about";
import { PlaceDetailHero } from "./place-detail/place-detail-hero";
import { PlaceDetailMayor } from "./place-detail/place-detail-mayor";
import { PlaceDetailPromo } from "./place-detail/place-detail-promo";
import { PlaceDetailRating } from "./place-detail/place-detail-rating";
import { PlaceDetailSibaSheet } from "./place-detail/place-detail-siba-sheet";
import { PlaceDetailVisit } from "./place-detail/place-detail-visit";
import { PlaceDetailVisitors } from "./place-detail/place-detail-visitors";
import { useResolvedPlaceAddress } from "./place-detail/place-detail-hooks";
import {
  buildVisitorSummary,
  placeKindLabel,
} from "./place-detail/place-detail.utils";

type PlaceDetailProps = {
  kind: PlaceKind;
  place: Place;
};

export const PlaceDetail = ({ kind, place }: PlaceDetailProps) => {
  const { authUserId, mySiba, setMySiba, user } = useContext(AppContext);
  const isBreederAccount =
    user?.account_type === "breeder" || mySiba?.account_type === "breeder";
  const queryClient = useQueryClient();
  const [showAll, setShowAll] = useState(false);
  const [selectedSibaId, setSelectedSibaId] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [optimisticRating, setOptimisticRating] = useState<number | null>(null);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [visitError, setVisitError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width:600px)");

  const { resolvedAddress, isResolvingAddress } = useResolvedPlaceAddress(
    place.address,
  );

  const visitsQuery = useQuery({
    queryKey: ["place-visits", kind, place.id],
    queryFn: () => fetchPlaceVisits(kind, place.id),
  });
  const ratingQuery = useQuery({
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

  const visits = visitsQuery.data ?? [];
  const visitorSummary = useMemo(() => buildVisitorSummary(visits), [visits]);

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
  }, [mySiba, visits]);
  const canVisitNow = canVisitPlaceAgain(latestMyVisit?.visited_at ?? null);
  const nextVisitAt = getNextPlaceVisitAt(latestMyVisit?.visited_at ?? null);

  const handleCopyPromo = async () => {
    if (!place.promo_code) return;
    try {
      await navigator.clipboard.writeText(place.promo_code);
    } catch {
      /* noop */
    }
  };

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

  const kindLabel = placeKindLabel(kind);

  return (
    <div className={stls.sheet}>
      <div className={stls.sheetHandle} />
      <PlaceDetailHero
        kind={kind}
        place={place}
        kindLabel={kindLabel}
        resolvedAddress={resolvedAddress}
        isResolvingAddress={isResolvingAddress}
        rating={rating}
        coverImage={coverImage}
        placeImages={placeImages}
      />

      {kind === "cafe" && (
        <PlaceDetailPromo place={place} onCopyPromo={handleCopyPromo} />
      )}

      <PlaceDetailRating
        previewRating={previewRating}
        effectiveMyRating={effectiveMyRating}
        myRating={myRating}
        rating={rating}
        totalRatings={totalRatings}
        ratingQueryLoading={ratingQuery.isLoading}
        ratePending={ratePlaceMutation.isPending}
        ratingError={ratingError}
        onRate={handleRate}
        onHover={setHoveredRating}
      />

      <PlaceDetailAbout kind={kind} place={place} />

      {!isBreederAccount ? (
        <PlaceDetailVisit
          canVisitNow={canVisitNow}
          nextVisitAt={nextVisitAt}
          visitPending={visitPlaceMutation.isPending}
          authUserId={authUserId}
          visitError={visitError}
          onVisit={handleVisitPlace}
        />
      ) : null}

      {visitorSummary.mayor && (
        <PlaceDetailMayor kind={kind} mayor={visitorSummary.mayor} />
      )}

      <PlaceDetailVisitors
        visitsLoading={visitsQuery.isLoading}
        visits={visits}
        summary={visitorSummary}
        showAll={showAll}
        onShowAll={() => setShowAll(true)}
        onPickSiba={setSelectedSibaId}
      />

      <PlaceDetailSibaSheet
        isMobile={isMobile}
        selectedSibaId={selectedSibaId}
        onClose={() => setSelectedSibaId(null)}
      />
    </div>
  );
};
