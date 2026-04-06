import { useMemo, useState } from "react";
import { Button, Input } from "../../shared/ui";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { YMaps, Map, Placemark, SearchControl } from "@pbe/react-yandex-maps";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../../shared/api/supabase-сlient";
import type { ShibaType } from "../../shared/types";
import { IconTree } from "../../shared/icons/IconTree";
import { IconEdit } from "../../shared/icons";
import { SibaToast } from "../../shared/ui";
import stls from "./kennel-section.module.sass";

type Kennel = {
  id: string;
  name: string;
  coordinates: [number, number] | null;
  address: string | null;
};

type Props = {
  siba: ShibaType | undefined;
  authUserId: string | undefined;
  editable?: boolean;
};

export const KennelSection = ({ siba, authUserId, editable = true }: Props) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"select" | "create">("select");
  const [nameDraft, setNameDraft] = useState("");
  const [coords, setCoords] = useState<[number, number]>([55.75, 37.57]);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null);
  const [toastText, setToastText] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["kennels", query],
    queryFn: async (): Promise<Kennel[]> => {
      const q = query.trim();
      if (!q) {
        const { data, error } = await supabase
          .from("kennels")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) return [];
        return (data ?? []) as unknown as Kennel[];
      }
      const { data, error } = await supabase
        .from("kennels")
        .select("*")
        .ilike("name", `%${q}%`)
        .limit(20);
      if (error) return [];
      return (data ?? []) as unknown as Kennel[];
    },
  });

  const myKennelQuery = useQuery({
    queryKey: ["siba-kennel", siba?.id],
    enabled: Boolean(siba?.id),
    queryFn: async (): Promise<Kennel | null> => {
      if (!siba?.id) return null;
      const { data, error } = await supabase
        .from("siba_kennels")
        .select("kennel_id, kennels(*)")
        .eq("siba_id", siba.id)
        .maybeSingle();
      if (error) return null;
      const k = (data as unknown as { kennels: Kennel } | null)?.kennels ?? null;
      return k;
    },
  });

  const relatedSibasQuery = useQuery({
    queryKey: ["kennel-sibas", myKennelQuery.data?.id],
    enabled: Boolean(myKennelQuery.data?.id),
    queryFn: async (): Promise<ShibaType[]> => {
      const kennelId = myKennelQuery.data?.id;
      if (!kennelId) return [];
      const { data: links, error: linksErr } = await supabase
        .from("siba_kennels")
        .select("siba_id")
        .eq("kennel_id", kennelId);
      if (linksErr) return [];
      const ids = (links ?? []).map((x: { siba_id: string }) => x.siba_id);
      if (!ids.length) return [];
      const { data: sibas, error: sibasErr } = await supabase
        .from("sibains")
        .select("*")
        .in("id", ids);
      if (sibasErr) return [];
      return (sibas ?? []) as ShibaType[];
    },
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
      setOpen(false);
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
      setSelectedKennel(null);
      setOpen(false);
      setToastText("Питомник убран из анкеты.");
      window.setTimeout(() => setToastText(null), 2200);
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!nameDraft.trim()) {
        throw new Error("Введите название питомника.");
      }
      const payload = {
        name: nameDraft.trim(),
        coordinates: coords,
        address: `${coords[0].toFixed(5)}, ${coords[1].toFixed(5)}`,
        created_by: authUserId ?? null,
      };
      const { data, error } = await supabase
        .from("kennels")
        .insert([payload])
        .select("*")
        .maybeSingle();
      if (error || !data) {
        throw new Error(error?.message ?? "Не удалось создать питомник.");
      }
      return data as Kennel;
    },
    onMutate: () => {
      setCreateError(null);
    },
    onSuccess: async (kennel) => {
      await attachMutation.mutateAsync(kennel.id);
      setNameDraft("");
      setMode("select");
      setToastText("Питомник создан.");
      window.setTimeout(() => setToastText(null), 2200);
    },
    onError: (error) => {
      setCreateError(error instanceof Error ? error.message : "Ошибка при создании питомника.");
    },
  });

  const ymapsApiKey = import.meta.env.VITE_YMAPS_API_KEY as string | undefined;
  const content = useMemo(
    () => (
      <div className={stls.section}>
        {myKennelQuery.isLoading ? (
          <div className={stls.muted}>Загружаем питомник...</div>
        ) : (
          <div className={stls.card}>
            <div className={stls.cardTop}>
              <div style={{ fontWeight: 700 }}>
                {myKennelQuery.data?.name ?? "Питомник не указан"}
              </div>
              {editable ? (
                <button
                  type="button"
                  className={stls.editIconBtn}
                  onClick={() => {
                    setOpen(true);
                    setMode("select");
                    setSelectedKennel(null);
                    setCreateError(null);
                  }}
                >
                  <IconEdit />
                </button>
              ) : null}
            </div>
            {myKennelQuery.data && relatedSibasQuery.data?.length ? (
              <div style={{ marginTop: 8 }}>
                <div className={stls.treeTitle}>
                  <IconTree />
                  <span>Генеалогическое древо</span>
                </div>
                <div className={stls.treeWrap}>
                  {relatedSibasQuery.data.map((rel) => (
                    <div key={rel.id} className={stls.treeChip}
                      onClick={() => {
                        const ev = new CustomEvent("open-siba-from-kennel", { detail: { sibaId: rel.id } });
                        window.dispatchEvent(ev);
                      }}
                    >
                      <img src={rel.photos ?? `/${rel.siba_icon}.png`} alt={rel.siba_name} className={stls.treeAvatar} />
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
    [myKennelQuery.data, myKennelQuery.isLoading, relatedSibasQuery.data, editable],
  );

  const selector = (
    <div className={stls.drawerContent}>
      <div className={stls.row}>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти питомник" />
        <Button size="small" variant="secondary" onClick={() => { setMode("create"); setSelectedKennel(null); setCreateError(null); }}>
          Создать
        </Button>
      </div>
      {mode === "select" ? (
        <div>
          {(listQuery.data ?? []).map((k) => (
            <div key={k.id} className={stls.listItem}
              onClick={() => setSelectedKennel(k)}
            >
              <span style={{ fontWeight: 600 }}>{k.name}</span>
            </div>
          ))}
          {selectedKennel && (
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <Button size="small" onClick={() => attachMutation.mutate(selectedKennel.id)} loading={attachMutation.isPending}>
                Выбрать
              </Button>
              <Button size="small" variant="secondary" onClick={() => setSelectedKennel(null)}>
                Отмена
              </Button>
            </div>
          )}
          {myKennelQuery.data && (
            <div style={{ marginTop: 10 }}>
              <Button
                size="small"
                variant="secondary"
                onClick={() => detachMutation.mutate()}
                loading={detachMutation.isPending}
              >
                Удалить у себя
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Название питомника" />
          {ymapsApiKey ? (
            <div style={{ marginTop: 10, border: "1px solid #E7E1D2", borderRadius: 14, overflow: "hidden" }}>
              <YMaps query={{ apikey: ymapsApiKey }}>
                <Map
                  width="100%"
                  height={180}
                  defaultState={{ center: coords, zoom: 10 }}
                  onActionTickComplete={(evt: unknown) => {
                    type YActionTickEvent = { get: (key: string) => unknown };
                    try {
                      const e = evt as YActionTickEvent;
                      const target = e?.get?.("target") as { options?: { get?: () => { fromGlobalPixels: (coords: [number, number], zoom: number) => [number, number] } } } | undefined;
                      const projection = target?.options?.get?.();
                      const tick = e?.get?.("tick") as { globalPixelCenter?: [number, number]; zoom?: number } | undefined;
                      if (projection?.fromGlobalPixels && tick?.globalPixelCenter && typeof tick.zoom === "number") {
                        const next = projection.fromGlobalPixels(tick.globalPixelCenter, tick.zoom);
                        setCoords(next);
                      }
                    } catch {
                      // noop
                    }
                  }}
                >
                  <SearchControl options={{ float: "right", noPlacemark: true }} />
                  <Placemark geometry={coords} options={{ preset: "islands#redIcon" }} />
                </Map>
              </YMaps>
            </div>
          ) : (
            <div style={{ color: "#74736E", marginTop: 8 }}>Карта недоступна</div>
          )}
          {createError && <div className={stls.error}>{createError}</div>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button size="small" onClick={() => createMutation.mutate()} loading={createMutation.isPending} disabled={!nameDraft.trim()}>
              Создать и привязать
            </Button>
            <Button size="small" variant="secondary" onClick={() => setMode("select")}>
              Назад
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {content}
      {isMobile ? (
        <SwipeableDrawer
          anchor="bottom"
          open={open && editable}
          onOpen={() => {}}
          onClose={() => setOpen(false)}
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
        <Dialog open={open && editable} onClose={() => setOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 2 } }}>
          {selector}
        </Dialog>
      )}
      <SibaToast text={toastText} />
    </>
  );
};

