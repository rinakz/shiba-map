import { useMemo, useState } from "react";
import { Button, Input } from "../../shared/ui";
import { Dialog, SwipeableDrawer, useMediaQuery } from "@mui/material";
import { YMaps, Map, Placemark, SearchControl } from "@pbe/react-yandex-maps";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "../../shared/api/supabase-сlient";
import type { ShibaType } from "../../shared/types";

type Kennel = {
  id: string;
  name: string;
  coordinates: [number, number] | null;
  address: string | null;
};

type Props = {
  siba: ShibaType | undefined;
  authUserId: string | undefined;
};

// Типы для события
interface ActionTickEvent {
  get(key: "target"): Map;
  get(key: "tick"): { globalPixelCenter: [number, number]; zoom: number };
}

// Тип для проекции
interface Projection {
  fromGlobalPixels(pixels: [number, number], zoom: number): Coordinate;
}

// Тип для координат
type Coordinate = [number, number];

// Тип для карты
interface Map {
  options: {
    get(): Projection;
  };
}

export const KennelSection = ({ siba, authUserId }: Props) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"select" | "create">("select");
  const [nameDraft, setNameDraft] = useState("");
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedKennel, setSelectedKennel] = useState<Kennel | null>(null);

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
      const k =
        (data as unknown as { kennels: Kennel } | null)?.kennels ?? null;
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
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!nameDraft.trim() || !coords) return;
      setCreating(true);
      const payload = {
        name: nameDraft.trim(),
        coordinates: coords,
        address: null,
        created_by: authUserId ?? null,
      };
      const { data, error } = await supabase
        .from("kennels")
        .insert([payload])
        .select("*")
        .maybeSingle();
      setCreating(false);
      if (error || !data) return null;
      return data as Kennel;
    },
    onSuccess: async (kennel) => {
      if (!kennel?.id) return;
      await attachMutation.mutateAsync(kennel.id);
    },
  });

  const ymapsApiKey = import.meta.env.VITE_YMAPS_API_KEY as string | undefined;
  const content = useMemo(
    () => (
      <div style={{ padding: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <span style={{ fontWeight: 700 }}>Питомник</span>
          <Button size="small" onClick={() => setOpen(true)}>
            {myKennelQuery.data ? "Изменить" : "Добавить"}
          </Button>
        </div>
        {myKennelQuery.isLoading ? (
          <div style={{ color: "#74736E" }}>Загружаем питомник...</div>
        ) : myKennelQuery.data ? (
          <div
            style={{
              background: "#FFFCF5",
              border: "1px solid #E7E1D2",
              borderRadius: 14,
              padding: 10,
            }}
          >
            <div style={{ fontWeight: 700 }}>{myKennelQuery.data.name}</div>
            {relatedSibasQuery.data?.length ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ color: "#74736E", marginBottom: 6 }}>
                  Генеалогическое древо
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {relatedSibasQuery.data.map((rel) => (
                    <div
                      key={rel.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 8px",
                        background: "#FFF8EA",
                        borderRadius: 12,
                        border: "1px solid #E7E1D2",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const ev = new CustomEvent("open-siba-from-kennel", {
                          detail: { sibaId: rel.id },
                        });
                        window.dispatchEvent(ev);
                      }}
                    >
                      <img
                        src={rel.photos ?? `/${rel.siba_icon}.png`}
                        alt={rel.siba_name}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          objectFit: "cover",
                        }}
                      />
                      <span style={{ fontSize: 13 }}>{rel.siba_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ color: "#74736E" }}>Питомник не указан</div>
        )}
      </div>
    ),
    [myKennelQuery.data, myKennelQuery.isLoading, relatedSibasQuery.data],
  );

  const selector = (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Найти питомник"
        />
        <Button
          size="small"
          variant="secondary"
          onClick={() => {
            setMode("create");
            setSelectedKennel(null);
          }}
        >
          Создать
        </Button>
      </div>
      {mode === "select" ? (
        <div>
          {(listQuery.data ?? []).map((k) => (
            <div
              key={k.id}
              style={{
                padding: "6px 0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onClick={() => setSelectedKennel(k)}
            >
              <span style={{ fontWeight: 600 }}>{k.name}</span>
            </div>
          ))}
          {selectedKennel && (
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <Button
                size="small"
                onClick={() => attachMutation.mutate(selectedKennel.id)}
                loading={attachMutation.isPending}
              >
                Выбрать
              </Button>
              <Button
                size="small"
                variant="secondary"
                onClick={() => setSelectedKennel(null)}
              >
                Отмена
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            placeholder="Название питомника"
          />
          {ymapsApiKey ? (
            <div
              style={{
                marginTop: 10,
                border: "1px solid #E7E1D2",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <YMaps query={{ apikey: ymapsApiKey }}>
                <Map
                  width="100%"
                  height={180}
                  defaultState={{ center: coords ?? [55.75, 37.57], zoom: 10 }}
                  onActionTickComplete={(evt: ActionTickEvent) => {
                    const projection = (
                      evt.get("target") as Map
                    ).options.get() as Projection;
                    const tick = evt.get("tick") as {
                      globalPixelCenter: [number, number];
                      zoom: number;
                    };
                    const next = projection.fromGlobalPixels(
                      tick.globalPixelCenter,
                      tick.zoom,
                    ) as Coordinate;
                    setCoords(next);
                  }}
                >
                  <SearchControl
                    options={{ float: "right", noPlacemark: true }}
                  />
                  {coords && (
                    <Placemark
                      geometry={coords}
                      options={{ preset: "islands#redIcon" }}
                    />
                  )}
                </Map>
              </YMaps>
            </div>
          ) : (
            <div style={{ color: "#74736E", marginTop: 8 }}>
              Карта недоступна
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Button
              size="small"
              onClick={() => createMutation.mutate()}
              loading={creating || createMutation.isPending}
              disabled={!nameDraft.trim() || !coords}
            >
              Создать и привязать
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => setMode("select")}
            >
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
          open={open}
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
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 2 } }}
        >
          {selector}
        </Dialog>
      )}
    </>
  );
};
