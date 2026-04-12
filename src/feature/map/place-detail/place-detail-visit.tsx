import { Button } from "../../../shared/ui";
import stls from "../place-sheet.module.sass";

type Props = {
  canVisitNow: boolean;
  nextVisitAt: Date | null;
  visitPending: boolean;
  authUserId: string | null | undefined;
  visitError: string | null;
  onVisit: () => void;
};

export const PlaceDetailVisit = ({
  canVisitNow,
  nextVisitAt,
  visitPending,
  authUserId,
  visitError,
  onVisit,
}: Props) => {
  return (
    <div className={stls.section}>
      <h4 className={stls.sectionTitle}>Отметиться в месте</h4>
      <div className={stls.visitActionCard}>
        {canVisitNow ? (
          <>
            <p className={stls.sectionText}>
              Отметься, чтобы попасть в список посетителей и побороться за звание
              мэра.
            </p>
            <Button
              size="small"
              className={stls.visitButton}
              onClick={onVisit}
              loading={visitPending}
              disabled={visitPending || !authUserId}
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
  );
};
