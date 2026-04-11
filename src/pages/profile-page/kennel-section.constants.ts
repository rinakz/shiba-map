/** Иконка домика на аватаре питомника в списке и карточке. */
export const KENNEL_ICON_COLOR = "#5E7C8C";

export const OPEN_SIBA_FROM_KENNEL_EVENT = "open-siba-from-kennel" as const;

export const kennelSectionQueryKeys = {
  breederCatalog: (search: string) =>
    ["kennels", search, "breeder-catalog"] as const,
  sibaKennel: (sibaId: string | undefined) =>
    ["siba-kennel", sibaId] as const,
  repAvatar: (kennelId: string | undefined) =>
    ["kennel-rep-avatar", kennelId] as const,
  kennelSibas: (kennelId: string | undefined) =>
    ["kennel-sibas", kennelId] as const,
  kennelSibasDrawer: (kennelId: string | undefined) =>
    ["kennel-sibas", kennelId, "drawer"] as const,
};

export const kennelTreeTitle = (isBreeder: boolean) =>
  isBreeder ? "Наши выпускники" : "Генеалогическое древо";
