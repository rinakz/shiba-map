import type { PlaceKind, PlaceVisit } from "../place-types";

export function placeKindLabel(kind: PlaceKind): string {
  if (kind === "cafe") return "Кафе для сибика";
  if (kind === "park") return "Парк для прогулок";
  return "Груминг-точка";
}

export function placeDescriptionFallback(kind: PlaceKind): string {
  if (kind === "cafe") {
    return "Дог-френдли место для перекуса после прогулки. Можно зайти с сибиком и отдохнуть.";
  }
  if (kind === "park") {
    return "Уютное место для длинных прогулок, знакомств и тренировок с хвостатыми.";
  }
  return "Точка, где можно привести шерсть и бублик в идеальный порядок.";
}

export function mayorPlaceSuffix(kind: PlaceKind): string {
  if (kind === "park") return "этого парка";
  if (kind === "cafe") return "этого кафе";
  return "этого места";
}

export function tryParseCoordsFromAddress(
  value: string,
): [number, number] | null {
  const trimmed = value.trim();
  if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed) || parsed.length < 2) return null;
    const lat = Number(parsed[0]);
    const lng = Number(parsed[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return [lat, lng];
  } catch {
    return null;
  }
}

export function formatCoords(coords: [number, number]): string {
  return `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`;
}

export type VisitorSummary = {
  uniqueVisitors: PlaceVisit[];
  visitCounts: Map<string, number>;
  mayor: { visit: PlaceVisit; count: number } | null;
  visitorsPreview: PlaceVisit[];
  extraVisitorsCount: number;
};

export function buildVisitorSummary(visits: PlaceVisit[]): VisitorSummary {
  const bySiba = new Map<string, PlaceVisit>();
  visits.forEach((visit) => {
    if (!bySiba.has(visit.siba_id)) {
      bySiba.set(visit.siba_id, visit);
    }
  });
  const uniqueVisitors = Array.from(bySiba.values());
  const visitCounts = new Map<string, number>();
  visits.forEach((visit) => {
    visitCounts.set(visit.siba_id, (visitCounts.get(visit.siba_id) ?? 0) + 1);
  });
  const ranked =
    uniqueVisitors.length > 0
      ? uniqueVisitors
          .map((visit) => ({
            visit,
            count: visitCounts.get(visit.siba_id) ?? 0,
          }))
          .sort((a, b) => b.count - a.count)
      : [];
  const mayor = ranked[0] ?? null;
  let visitorsPreview: PlaceVisit[] = [];
  if (uniqueVisitors.length) {
    if (!mayor) {
      visitorsPreview = uniqueVisitors.slice(0, 3);
    } else {
      const rest = uniqueVisitors.filter(
        (visit) => visit.siba_id !== mayor.visit.siba_id,
      );
      visitorsPreview = [mayor.visit, ...rest].slice(0, 3);
    }
  }
  const extraVisitorsCount = Math.max(
    uniqueVisitors.length - visitorsPreview.length,
    0,
  );
  return {
    uniqueVisitors,
    visitCounts,
    mayor,
    visitorsPreview,
    extraVisitorsCount,
  };
}
