import { Skeleton } from "@mui/material";
import { IconCrown } from "../../../shared/icons/IconCrown";
import { Button } from "../../../shared/ui";
import type { PlaceVisit } from "../place-types";
import type { VisitorSummary } from "./place-detail.utils";
import stls from "../place-sheet.module.sass";

type Props = {
  visitsLoading: boolean;
  visits: PlaceVisit[];
  summary: VisitorSummary;
  showAll: boolean;
  onShowAll: () => void;
  onPickSiba: (sibaId: string) => void;
};

export const PlaceDetailVisitors = ({
  visitsLoading,
  visits,
  summary,
  showAll,
  onShowAll,
  onPickSiba,
}: Props) => {
  const {
    uniqueVisitors,
    mayor,
    visitorsPreview,
    extraVisitorsCount,
  } = summary;

  return (
    <div className={stls.section}>
      {uniqueVisitors.length ? (
        <h4 className={stls.sectionTitle}>
          Тут гуляли ({uniqueVisitors.length})
        </h4>
      ) : (
        <h4 className={stls.sectionTitle}>Тут ещё не гуляли</h4>
      )}
      {visitsLoading ? (
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
                  onClick={() => onPickSiba(visit.siba_id)}
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
                  onClick={() => onPickSiba(visit.siba_id)}
                >
                  <img
                    className={stls.visitorAvatar}
                    src={
                      visit.siba_photo ?? `/${visit.siba_icon ?? "default"}.png`
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
            <Button size="small" onClick={onShowAll}>
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
  );
};
