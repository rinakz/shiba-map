import { useEffect, useMemo, useState } from "react";
import { LinearProgress } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../shared/api/supabase-сlient";
import { Button, Input } from "../../shared/ui";
import {
  IconEdit,
  IconParasite,
  IconVaccine,
} from "../../shared/icons";
import stls from "./health-section.module.sass";
import type {
  AccordionKey,
  DrugOption,
  HealthSectionProps,
  ParasiteRow,
  VaccineKey,
  VaccineRow,
} from "./health-section.types";
import {
  DRUG_OPTIONS,
  VACCINE_TITLES,
  getCycleDays,
  getParasiteProgress,
  getVaccineStatus,
} from "./health-section.utils";

export const HealthSection = ({ sibaId }: HealthSectionProps) => {
  const queryClient = useQueryClient();
  const [openKey, setOpenKey] = useState<AccordionKey>("vaccination");
  const [vaccines, setVaccines] = useState<Record<VaccineKey, string>>({
    rabies: "",
    complex: "",
  });

  const [drug, setDrug] = useState<DrugOption>("Bravecto");
  const [customDrug, setCustomDrug] = useState("");
  const [drugDate, setDrugDate] = useState("");
  const [cycleDaysDraft, setCycleDaysDraft] = useState("30");
  const [nowTs, setNowTs] = useState<number | null>(null);

  const vaccinesQuery = useQuery<VaccineRow | null>({
    queryKey: ["health-vaccination", sibaId],
    enabled: Boolean(sibaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_health_vaccination")
        .select("siba_id,rabies_last_shot,complex_last_shot")
        .eq("siba_id", sibaId!)
        .maybeSingle();
      if (error) throw error;
      return (data as VaccineRow | null) ?? null;
    },
  });

  const parasitesQuery = useQuery<ParasiteRow | null>({
    queryKey: ["health-parasites", sibaId],
    enabled: Boolean(sibaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_health_parasites")
        .select("siba_id,drug_name,custom_drug_name,taken_at,cycle_days")
        .eq("siba_id", sibaId!)
        .maybeSingle();
      if (error) throw error;
      return (data as ParasiteRow | null) ?? null;
    },
  });

  useEffect(() => {
    const updateNow = () => setNowTs(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const data = vaccinesQuery.data;
    if (!data) return;
    const timer = window.setTimeout(() => {
      setVaccines({
        rabies: data.rabies_last_shot ?? "",
        complex: data.complex_last_shot ?? "",
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [vaccinesQuery.data]);

  useEffect(() => {
    const data = parasitesQuery.data;
    if (!data) return;
    const timer = window.setTimeout(() => {
      const normalizedDrug = (DRUG_OPTIONS.find((d) => d === data.drug_name) ??
        "Свой вариант") as DrugOption;
      setDrug(normalizedDrug);
      setCustomDrug(data.custom_drug_name ?? "");
      setDrugDate(data.taken_at ?? "");
      setCycleDaysDraft(String(data.cycle_days ?? 30));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [parasitesQuery.data]);

  const saveVaccinesMutation = useMutation({
    mutationFn: async () => {
      if (!sibaId) return;
      const payload: VaccineRow = {
        siba_id: sibaId,
        rabies_last_shot: vaccines.rabies || null,
        complex_last_shot: vaccines.complex || null,
      };
      const { error } = await supabase
        .from("siba_health_vaccination")
        .upsert(payload, { onConflict: "siba_id" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["health-vaccination", sibaId] });
    },
  });

  const saveParasitesMutation = useMutation({
    mutationFn: async () => {
      if (!sibaId) return;
      const cycleDays =
        getCycleDays(drug, cycleDaysDraft);
      const payload: ParasiteRow = {
        siba_id: sibaId,
        drug_name: drug,
        custom_drug_name: drug === "Свой вариант" ? customDrug || null : null,
        taken_at: drugDate || null,
        cycle_days: cycleDays,
      };
      const { error } = await supabase
        .from("siba_health_parasites")
        .upsert(payload, { onConflict: "siba_id" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["health-parasites", sibaId] });
    },
  });

  const parasiteProgress = useMemo(() => {
    return getParasiteProgress({ drugDate, drug, cycleDaysDraft, nowTs });
  }, [drug, drugDate, cycleDaysDraft, nowTs]);

  const toggle = (key: AccordionKey) => {
    setOpenKey((prev) => (prev === key ? prev : key));
  };

  const renderHeader = (key: AccordionKey, title: string, icon: "vaccine" | "parasite") => (
    <button className={stls.header} onClick={() => toggle(key)} type="button">
      <span className={stls.leftIconPlaceholder}>
        {icon === "vaccine" ? (
          <IconVaccine />
        ) : icon === "parasite" ? (
          <IconParasite />
        ) : null}
      </span>
      <span className={stls.title}>{title}</span>
      <span className={stls.rightPencilPlaceholder}>
        <IconEdit />
      </span>
    </button>
  );

  const isHealthLoading = vaccinesQuery.isLoading || parasitesQuery.isLoading;

  if (isHealthLoading && !vaccinesQuery.data && !parasitesQuery.data) {
    return (
      <div className={stls.root}>
        <Skeleton variant="rounded" height={56} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={140} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={56} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" height={140} />
      </div>
    );
  }

  return (
    <div className={stls.root}>
      {renderHeader("vaccination", "Вакцинация", "vaccine")}
      <div
        className={`${stls.body} ${
          openKey === "vaccination" ? stls.bodyOpen : stls.bodyClosed
        }`}
      >
        <div className={stls.bodyInner}>
          {(Object.keys(VACCINE_TITLES) as VaccineKey[]).map((key) => {
            const status = getVaccineStatus(vaccines[key], nowTs);
            return (
              <div key={key} className={stls.block}>
                <div className={stls.rowTitle}>{VACCINE_TITLES[key]}</div>
                <Input
                  type="date"
                  value={vaccines[key]}
                  onChange={(e) =>
                    setVaccines((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
                {status?.isExpired && <div className={stls.expired}>Срок истек</div>}
                {!status?.isExpired && status && (
                  <div className={stls.metaText}>
                    До следующей вакцинации: {status.leftDays} дн.
                  </div>
                )}
              </div>
            );
          })}
          <Button
            size="small"
            onClick={() => saveVaccinesMutation.mutate()}
            loading={saveVaccinesMutation.isPending}
            disabled={!sibaId || saveVaccinesMutation.isPending}
          >
            Сохранить вакцинацию
          </Button>
        </div>
      </div>

      {renderHeader("parasites", "Паразиты", "parasite")}
      <div
        className={`${stls.body} ${
          openKey === "parasites" ? stls.bodyOpen : stls.bodyClosed
        }`}
      >
        <div className={stls.bodyInner}>
          <div className={stls.block}>
            <div className={stls.rowTitle}>Препарат</div>
            <select
              className={stls.select}
              value={drug}
              onChange={(e) => setDrug(e.target.value as DrugOption)}
            >
              {DRUG_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {drug === "Свой вариант" && (
              <>
                <Input
                  value={customDrug}
                  onChange={(e) => setCustomDrug(e.target.value)}
                  placeholder="Введите название препарата"
                />
                <Input
                  type="number"
                  value={cycleDaysDraft}
                  onChange={(e) => setCycleDaysDraft(e.target.value)}
                  placeholder="Цикл в днях"
                />
              </>
            )}
          </div>

          <div className={stls.block}>
            <div className={stls.rowTitle}>Дата приема</div>
            <Input
              type="date"
              value={drugDate}
              onChange={(e) => setDrugDate(e.target.value)}
            />
          </div>

          <div className={stls.block}>
            <div className={stls.rowTitle}>До следующей обработки</div>
            <LinearProgress
              variant="determinate"
              value={100 - parasiteProgress.progress}
              sx={{
                height: 10,
                borderRadius: 999,
                backgroundColor: "#E7E1D2",
                "& .MuiLinearProgress-bar": { backgroundColor: "#E95B47" },
              }}
            />
            <div className={stls.metaText}>
              {parasiteProgress.leftDays === null
                ? "Выберите дату приема"
                : `Осталось ${parasiteProgress.leftDays} дн.`}
            </div>
          </div>
          <Button
            size="small"
            onClick={() => saveParasitesMutation.mutate()}
            loading={saveParasitesMutation.isPending}
            disabled={!sibaId || saveParasitesMutation.isPending}
          >
            Сохранить обработку
          </Button>
        </div>
      </div>

    </div>
  );
};
