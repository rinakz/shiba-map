import { IconCrown } from "../../../shared/icons/IconCrown";
import type { PlaceKind } from "../place-types";
import type { PlaceVisit } from "../place-types";
import { mayorPlaceSuffix } from "./place-detail.utils";
import stls from "../place-sheet.module.sass";

type Props = {
  kind: PlaceKind;
  mayor: { visit: PlaceVisit; count: number };
};

export const PlaceDetailMayor = ({ kind, mayor }: Props) => {
  return (
    <div className={stls.mayorCard}>
      <span className={stls.mayorCrown}>
        <IconCrown />
      </span>
      <span>
        <b>{mayor.visit.siba_name ?? "Сиба"}</b> — мэр {mayorPlaceSuffix(kind)}
        . Был здесь {mayor.count} раз.
      </span>
    </div>
  );
};
