import { useCallback, useMemo, useState, type FC } from "react";
import { Button, Input } from "../../shared/ui";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buildSafeAvatarSrc } from "../../shared/header/news-panel/news-panel.utils";
import {
  fetchKennelForBreederProfile,
  fetchPublicKennelForBreederSiba,
} from "../../shared/api/breeder";
import type { ShibaType } from "../../shared/types";
import { IconTree } from "../../shared/icons/IconTree";
import { IconEdit } from "../../shared/icons";
import { IconHouse } from "../../shared/icons/IconHouse";
import { SibaToast } from "../../shared/ui";
import { supabase } from "../../shared/api/supabase-сlient";
import {
  KENNEL_ICON_COLOR,
  kennelSectionQueryKeys,
  kennelTreeTitle,
} from "./kennel-section.constants";
import type { KennelSectionProps, KennelWithAvatar } from "./kennel-section.types";
import {
  buildBreederInviteShareText,
  buildGraduateOwnerInviteShareText,
  dispatchOpenSibaFromKennel,
  fetchBreederKennelCatalogWithAvatars,
  fetchKennelRepresentativeAvatarMap,
  fetchMyKennelForSiba,
  fetchSibasByKennelId,
  sumSibaLevels,
} from "./kennel-section.utils";
import stls from "./kennel-section.module.sass";

export const KennelSection: FC<KennelSectionProps> = ({
  siba,
  authUserId,
  editable = true,
  accountType = "owner",
  breederRepairHint = null,
}) => {
  const queryClient = useQueryClient();
  const isBreeder = accountType === "breeder";
  const isMobile = useMediaQuery("(max-width:600px)");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [detailKennel, setDetailKennel] = useState<KennelWithAvatar | null>(
    null,
  );
  const [toastText, setToastText] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: kennelSectionQueryKeys.breederCatalog(query),
    enabled: !isBreeder && open,
    queryFn: () => fetchBreederKennelCatalogWithAvatars(query),
  });

  const breederKennelQuery = useQuery({
    queryKey: isBreeder
      ? editable
        ? [
            "breeder-kennel",
            authUserId,
            siba?.id,
            breederRepairHint?.kennel_name,
            breederRepairHint?.kennel_city,
            breederRepairHint?.siba_name,
          ]
        : ["breeder-kennel-public", siba?.id]
      : ["breeder-kennel", "off"],
    queryFn: async () => {
      if (!isBreeder || !siba?.id) return null;
      if (!editable) {
        return fetchPublicKennelForBreederSiba(siba.id);
      }
      if (!authUserId) return null;
      return fetchKennelForBreederProfile(
        authUserId,
        siba.id,
        breederRepairHint ?? undefined,
      );
    },
    enabled: Boolean(
      isBreeder &&
        siba?.id &&
        (editable ? Boolean(authUserId) : true),
    ),
  });

  const myKennelQuery = useQuery({
    queryKey: kennelSectionQueryKeys.sibaKennel(siba?.id),
    enabled: Boolean(siba?.id && !isBreeder),
    queryFn: async () => {
      if (!siba?.id) return null;
      return fetchMyKennelForSiba(siba.id);
    },
  });

  const displayKennel = isBreeder
    ? breederKennelQuery.data
    : myKennelQuery.data;

  const displayKennelAvatarQuery = useQuery({
    queryKey: kennelSectionQueryKeys.repAvatar(displayKennel?.id),
    enabled: Boolean(displayKennel?.id),
    queryFn: async () => {
      const m = await fetchKennelRepresentativeAvatarMap([displayKennel!.id]);
      return m.get(displayKennel!.id) ?? buildSafeAvatarSrc(null, "sibka");
    },
  });

  /** Анкета заводчика в списке siba_kennels — не «выпускник»; user_id для сравнения ненадёжен. */
  const excludeRepSibaId = isBreeder && siba?.id ? String(siba.id) : null;

  const relatedSibasQuery = useQuery({
    queryKey: kennelSectionQueryKeys.kennelSibas(
      displayKennel?.id,
      excludeRepSibaId,
    ),
    enabled: Boolean(displayKennel?.id),
    queryFn: () =>
      fetchSibasByKennelId(
        displayKennel!.id,
        excludeRepSibaId
          ? { excludeSibaId: excludeRepSibaId }
          : undefined,
      ),
  });

  const detailSibasQuery = useQuery({
    queryKey: kennelSectionQueryKeys.kennelSibasDrawer(detailKennel?.id),
    enabled: Boolean(open && detailKennel?.id),
    queryFn: () => fetchSibasByKennelId(detailKennel!.id),
  });

  const attachMutation = useMutation({
    mutationFn: async (kennelId: string) => {
      if (!siba?.id) return;
      await supabase
        .from("siba_kennels")
        .upsert({ siba_id: siba.id, kennel_id: kennelId });
    },
    onSuccess: async () => {
      await myKennelQuery.refetch();
      await relatedSibasQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["kennel-sibas"] });
      await queryClient.invalidateQueries({ queryKey: ["kennel-rep-avatar"] });
      setOpen(false);
      setDetailKennel(null);
      setToastText("Питомник обновлен.");
      window.setTimeout(() => setToastText(null), 2200);
    },
  });

  const detachMutation = useMutation({
    mutationFn: async () => {
      if (!siba?.id) return;
      await supabase
        .from("siba_kennels")
        .delete()
        .eq("siba_id", siba.id);
    },
    onSuccess: async () => {
      await myKennelQuery.refetch();
      await relatedSibasQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ["kennel-rep-avatar"] });
      setDetailKennel(null);
      setOpen(false);
      setToastText("Питомник убран из анкеты.");
      window.setTimeout(() => setToastText(null), 2200);
    },
  });

  const copyInviteBreeder = useCallback(() => {
    void navigator.clipboard.writeText(buildBreederInviteShareText());
    setToastText("Текст со ссылкой скопирован в буфер");
    window.setTimeout(() => setToastText(null), 2400);
  }, []);

  const copyInviteGraduate = useCallback(() => {
    void navigator.clipboard.writeText(buildGraduateOwnerInviteShareText());
    setToastText("Текст со ссылкой скопирован в буфер");
    window.setTimeout(() => setToastText(null), 2400);
  }, []);

  const kennelLoading = isBreeder
    ? breederKennelQuery.isLoading
    : myKennelQuery.isLoading;

  const treeTitle = kennelTreeTitle(isBreeder);

  const totalLevels = sumSibaLevels(relatedSibasQuery.data ?? []);

  const openDrawer = () => {
    setOpen(true);
    setDetailKennel(null);
    setQuery("");
  };

  const content = useMemo(
    () => (
      <div className={stls.section}>
        {kennelLoading ? (
          <div className={stls.card}>
            <Skeleton variant="text" width="55%" height={28} />
            <Skeleton variant="rounded" width="100%" height={56} />
          </div>
        ) : (
          <div className={stls.card}>
            <div className={stls.cardTop}>
              {displayKennel ? (
                <div className={stls.kennelTitleRow}>
                  <div className={stls.kennelTitleAvatarWrap}>
                    {displayKennelAvatarQuery.isLoading ? (
                      <Skeleton
                        variant="circular"
                        width={44}
                        height={44}
                        className={stls.kennelTitleAvatar}
                      />
                    ) : (
                      <img
                        src={
                          displayKennelAvatarQuery.data ??
                          buildSafeAvatarSrc(null, "sibka")
                        }
                        alt=""
                        className={stls.kennelTitleAvatar}
                      />
                    )}
                    <span className={stls.kennelTitleHouseBadge} aria-hidden>
                      <IconHouse size={15} color={KENNEL_ICON_COLOR} />
                    </span>
                  </div>
                  <span className={stls.kennelTitleText}>{displayKennel.name}</span>
                </div>
              ) : (
                <div className={stls.kennelTitleRow}>
                  <span className={stls.kennelUnset}>Питомник не указан</span>
                </div>
              )}
              {editable && !isBreeder ? (
                <button
                  type="button"
                  className={stls.editIconBtn}
                  onClick={openDrawer}
                >
                  <IconEdit />
                </button>
              ) : null}
            </div>
            {isBreeder && displayKennel?.id ? (
              <div style={{ marginTop: 10, fontSize: 13, color: "#74736E" }}>
                Выпускников в приложении:{" "}
                <strong>{relatedSibasQuery.data?.length ?? 0}</strong>
                {" · "}
                Суммарный уровень стаи: <strong>{totalLevels}</strong>
              </div>
            ) : null}
            {editable && isBreeder && displayKennel?.id ? (
              <div style={{ marginTop: 12 }}>
                <Button size="small" variant="secondary" onClick={copyInviteGraduate}>
                  Пригласить выпускника (скопировать текст)
                </Button>
              </div>
            ) : null}
            {displayKennel && relatedSibasQuery.isLoading ? (
              <div style={{ marginTop: 8 }}>
                <div className={stls.treeTitle}>
                  <IconTree />
                  <span>{treeTitle}</span>
                </div>
                <div className={stls.treeWrap}>
                  <Skeleton variant="rounded" width={88} height={34} />
                  <Skeleton variant="rounded" width={94} height={34} />
                  <Skeleton variant="rounded" width={78} height={34} />
                </div>
              </div>
            ) : displayKennel && relatedSibasQuery.data?.length ? (
              <div style={{ marginTop: 8 }}>
                <div className={stls.treeTitle}>
                  <IconTree />
                  <span>{treeTitle}</span>
                </div>
                <div className={stls.treeWrap}>
                  {relatedSibasQuery.data.map((rel) => (
                    <div
                      key={rel.id}
                      className={stls.treeChip}
                      onClick={() => dispatchOpenSibaFromKennel(rel.id)}
                    >
                      <img
                        src={rel.photos ?? `/${rel.siba_icon}.png`}
                        alt={rel.siba_name}
                        className={stls.treeAvatar}
                      />
                      <span style={{ fontSize: 13 }}>{rel.siba_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    ),
    [
      displayKennel,
      displayKennelAvatarQuery.data,
      displayKennelAvatarQuery.isLoading,
      kennelLoading,
      relatedSibasQuery.data,
      relatedSibasQuery.isLoading,
      editable,
      isBreeder,
      treeTitle,
      totalLevels,
      copyInviteBreeder,
      copyInviteGraduate,
    ],
  );

  const renderTree = (rows: ShibaType[] | undefined, loading: boolean) => {
    if (loading) {
      return (
        <div className={stls.treeWrap}>
          <Skeleton variant="rounded" width={88} height={34} />
          <Skeleton variant="rounded" width={94} height={34} />
        </div>
      );
    }
    if (!rows?.length) {
      return (
        <p className={stls.muted} style={{ margin: "8px 0 0", fontSize: 13 }}>
          Пока нет связанных сиб в приложении
        </p>
      );
    }
    return (
      <div className={stls.treeWrap}>
        {rows.map((rel) => (
          <div
            key={rel.id}
            className={stls.treeChip}
            onClick={() => dispatchOpenSibaFromKennel(rel.id)}
          >
            <img
              src={rel.photos ?? `/${rel.siba_icon}.png`}
              alt={rel.siba_name}
              className={stls.treeAvatar}
            />
            <span style={{ fontSize: 13 }}>{rel.siba_name}</span>
          </div>
        ))}
      </div>
    );
  };

  const shouldRenderKennelSection =
    editable || kennelLoading || Boolean(displayKennel);

  const selector = (
    <div className={stls.drawerContent}>
      {!detailKennel ? (
        <>
          <div className={stls.row}>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найти питомник"
            />
          </div>
          {listQuery.isLoading ? (
            <>
              <Skeleton variant="rounded" width="100%" height={36} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" width="100%" height={36} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" width="72%" height={36} />
            </>
          ) : (listQuery.data ?? []).length === 0 ? (
            <p className={stls.muted} style={{ margin: "8px 0", fontSize: 14 }}>
              Питомники не найдены. Попробуйте другой запрос или пригласите заводчика.
            </p>
          ) : (
            (listQuery.data ?? []).map((k) => (
              <button
                key={k.id}
                type="button"
                className={stls.listItemBtn}
                onClick={() => setDetailKennel(k)}
              >
                <div className={stls.listItemAvatarWrap}>
                  <img
                    src={k.avatarSrc}
                    alt=""
                    className={stls.listItemAvatar}
                  />
                  <span className={stls.listItemHouseBadge} aria-hidden>
                    <IconHouse size={12} color={KENNEL_ICON_COLOR} />
                  </span>
                </div>
                <span className={stls.listItemText}>
                  <span className={stls.listItemName}>{k.name}</span>
                  {k.prefix ? (
                    <span className={stls.listItemPrefix}>{k.prefix}</span>
                  ) : null}
                </span>
              </button>
            ))
          )}
          <div className={stls.drawerInvite}>
            <Button size="small" variant="secondary" onClick={copyInviteBreeder}>
              Нет питомника? Пригласить заводчика
            </Button>
          </div>
        </>
      ) : (
        <div className={stls.detailWrap}>
          <button
            type="button"
            className={stls.detailBack}
            onClick={() => setDetailKennel(null)}
          >
            ← К списку
          </button>
          <div className={stls.detailHead}>
            <div className={stls.detailAvatarWrap}>
              <img
                src={detailKennel.avatarSrc}
                alt=""
                className={stls.detailAvatar}
              />
              <span className={stls.detailHouseBadge} aria-hidden>
                <IconHouse size={16} color={KENNEL_ICON_COLOR} />
              </span>
            </div>
            <div>
              <div className={stls.detailName}>{detailKennel.name}</div>
              {detailKennel.prefix ? (
                <div className={stls.detailPrefix}>{detailKennel.prefix}</div>
              ) : null}
              {detailKennel.address ? (
                <div className={stls.detailAddress}>{detailKennel.address}</div>
              ) : null}
            </div>
          </div>
          <div className={stls.treeTitle}>
            <IconTree />
            <span>Генеалогическое древо</span>
          </div>
          {renderTree(detailSibasQuery.data, detailSibasQuery.isLoading)}
          <div className={stls.detailActions}>
            {myKennelQuery.data?.id === detailKennel.id ? (
              <Button
                size="small"
                variant="secondary"
                onClick={() => detachMutation.mutate()}
                loading={detachMutation.isPending}
              >
                Убрать из анкеты
              </Button>
            ) : (
              <Button
                size="small"
                onClick={() => attachMutation.mutate(detailKennel.id)}
                loading={attachMutation.isPending}
              >
                Выбрать этот питомник
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {shouldRenderKennelSection ? content : null}
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={open && editable && !isBreeder}
          onOpen={() => {}}
          onClose={() => {
            setOpen(false);
            setDetailKennel(null);
          }}
          PaperProps={{
            sx: {
              height: "auto",
              maxHeight: "85vh",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {selector}
        </SwipeableDrawer>
      ) : (
        <Dialog
          open={open && editable && !isBreeder}
          onClose={() => {
            setOpen(false);
            setDetailKennel(null);
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          {selector}
        </Dialog>
      )}
      <SibaToast text={toastText} />
    </>
  );
};
