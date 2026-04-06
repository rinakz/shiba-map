import { useEffect, useMemo, useState } from "react";
import Skeleton from "@mui/material/Skeleton";
import { Button, IconButton, Input, LayoutPage, SibaToast } from "../../shared/ui";
import { IconPDF, IconRight } from "../../shared/icons";
import { useNavigate } from "react-router-dom";
import { PATH } from "../../shared/constants/path";
import { AppContext } from "../../shared/context/app-context";
import { useContext } from "react";
import stls from "./health-pass-page.module.sass";
import { useDogHealth } from "./use-dog-health";
import { confirmPdfGeneration, generateHealthPassPdf } from "./pdfGenerator";
import { DRUG_OPTIONS, getCycleDays, isDrugOption } from "../profile-page/health-section.utils";
import type { DrugOption } from "../profile-page/health-section.types";
import { MEDICAL_TAGS, buildChartPath } from "./health-pass.utils";

 

export const HealthPassPage = () => {
  const navigate = useNavigate();
  const { mySiba } = useContext(AppContext);
  const health = useDogHealth(mySiba);
  const [weightDraft, setWeightDraft] = useState("");
  const [dateDraft, setDateDraft] = useState(new Date().toISOString().slice(0, 10));
  const [toast, setToast] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [savingField, setSavingField] = useState<string | null>(null);
  const parasite = health.parasiteSettingsQuery.data ?? { drug_name: "Simparica", custom_drug_name: null, taken_at: "", cycle_days: 30 };
  const [drug, setDrug] = useState<DrugOption>((parasite.drug_name as DrugOption) ?? "Simparica");
  const [customDrug, setCustomDrug] = useState(parasite.custom_drug_name ?? "");
  const [cycleDaysDraft, setCycleDaysDraft] = useState(String(parasite.cycle_days ?? 30));
  useEffect(() => {
    setDrug((parasite.drug_name as DrugOption) ?? "Simparica");
    setCustomDrug(parasite.custom_drug_name ?? "");
    setCycleDaysDraft(String(parasite.cycle_days ?? 30));
  }, [parasite.cycle_days, parasite.custom_drug_name, parasite.drug_name]);

  const aid = health.aidQuery.data ?? {
    enterosgel: false, chlorhexidine: false, antihistamine: false, bandage: false, self_fixing_patch: false,
  };
  const [aidLocal, setAidLocal] = useState(aid);
  useEffect(() => {
    setAidLocal(aid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [health.aidQuery.data]);
  const tags = health.medicalIdQuery.data?.tags ?? [];

  const chartPath = useMemo(
    () => buildChartPath(health.weightQuery.data ?? []),
    [health.weightQuery.data],
  );

  const healthyRange = mySiba?.siba_gender === "female" ? [7, 10] : [10, 13];
  const latestWeight = health.weightQuery.data?.[health.weightQuery.data.length - 1]?.weight_kg ?? null;
  const isOutOfRange = latestWeight !== null && (latestWeight < healthyRange[0] || latestWeight > healthyRange[1]);
  const completionPercent = useMemo(() => {
    const hasWeight = Boolean(health.weightQuery.data?.length);
    const hasVaccA = Boolean(health.vaccQuery.data?.rabies_last_shot);
    const hasVaccB = Boolean(health.vaccQuery.data?.complex_last_shot);
    const hasTreat = Boolean(health.treatmentsQuery.data?.ticks_last_treatment) || Boolean(health.treatmentsQuery.data?.worms_last_treatment);
    const hasAid = Object.values(aid).some(Boolean);
    const hasMedical = tags.length > 0 || Boolean((health.medicalIdQuery.data?.note ?? "").trim());
    const score = [hasWeight, hasVaccA, hasVaccB, hasTreat, hasAid, hasMedical].filter(Boolean).length;
    return Math.round((score / 6) * 100);
  }, [aid, tags, health.weightQuery.data, health.vaccQuery.data, health.treatmentsQuery.data, health.medicalIdQuery.data]);
  const currentCycleDays = getCycleDays(drug, cycleDaysDraft);
  const isParasiteDirty =
    drug !== ((parasite.drug_name as DrugOption) ?? "Simparica") ||
    (drug === "Свой вариант" && customDrug.trim() !== (parasite.custom_drug_name ?? "")) ||
    currentCycleDays !== (parasite.cycle_days ?? 30);

  if (health.isLoading && !health.weightQuery.data) {
    return (
      <LayoutPage><div className={stls.page}><Skeleton variant="rounded" height={80} /><Skeleton variant="rounded" height={220} /></div></LayoutPage>
    );
  }

  return (
    <LayoutPage>
      <div className={stls.page}>
        <div className={stls.header}>
          <IconButton
            size="medium"
            variant="secondary"
            icon={<span style={{ display: "flex", transform: "rotate(-180deg)" }}><IconRight /></span>}
            onClick={() => navigate(PATH.Profile)}
          />
          <h1 className={stls.title}>Медкнижка {mySiba?.siba_name}</h1>
          <Button
            size="small"
            className={stls.downloadBtn}
            iconRight={<IconPDF size={16} color="#FFFCF5" />}
            loading={isPdfLoading}
            disabled={!mySiba?.id}
            onClick={async () => {
              const ok = await confirmPdfGeneration();
              if (!ok) return;
              setIsPdfLoading(true);
              try {
                const textTag = (note ?? "").trim();
                const exportTags = textTag ? (tags.includes(textTag) ? tags : [...tags, textTag]) : tags;
                await generateHealthPassPdf({
                  sibaName: mySiba?.siba_name ?? "Siba",
                  photoUrl: mySiba?.photos ?? (mySiba?.siba_icon ? `/${mySiba.siba_icon}.png` : undefined),
                  currentWeight: latestWeight,
                  vaccines: [
                    { title: "Бешенство", value: health.vaccQuery.data?.rabies_last_shot ?? "" },
                    { title: "Комплексная", value: health.vaccQuery.data?.complex_last_shot ?? "" },
                    { title: "Клещи", value: health.treatmentsQuery.data?.ticks_last_treatment ?? "" },
                    { title: "Глисты", value: health.treatmentsQuery.data?.worms_last_treatment ?? "" },
                  ],
                  medicalFeatures: exportTags,
                  note: null,
                });
                setToast("PDF-паспорт сохранен.");
              } catch {
                setToast("Не удалось сформировать PDF.");
              } finally {
                setIsPdfLoading(false);
                window.setTimeout(() => setToast(null), 2200);
              }
            }}
          >
            Скачать медпаспорт
          </Button>
        </div>

        <div className={stls.card}>
          <h3>Контроль веса</h3>
          <div className={stls.row}>
            <Input type="number" value={weightDraft} onChange={(e) => setWeightDraft(e.target.value)} placeholder="Вес, кг" />
            <Input type="date" value={dateDraft} onChange={(e) => setDateDraft(e.target.value)} />
            <Button
              size="small"
              loading={health.addWeight.isPending}
              disabled={health.addWeight.isPending}
              onClick={() => {
                const w = Number(weightDraft);
                if (!w || !dateDraft) return;
                health.addWeight.mutate({ weight_kg: w, measured_at: dateDraft }, { onSuccess: () => {
                  setToast("Вес сохранен.");
                  setWeightDraft("");
                  if (completionPercent >= 80) {
                    setToast("Твоя медкнижка заполнена на 80%! Теперь ты можешь скачать PDF-паспорт, чтобы он всегда был под рукой у врача.");
                  }
                  window.setTimeout(() => setToast(null), 1800);
                } });
              }}
            >
              Добавить
            </Button>
          </div>
          <div className={stls.meta}>Норма для сибы: суки 7–10 кг, кобели 10–13 кг.</div>
          {latestWeight !== null && (
            <div className={`${stls.meta} ${isOutOfRange ? stls.warn : ""}`}>
              Последний вес: {latestWeight} кг {isOutOfRange ? "(вне нормы)" : "(в норме)"}
            </div>
          )}
          <svg viewBox="0 0 100 100" className={stls.chart} preserveAspectRatio="none">
            <line x1="0" y1={mySiba?.siba_gender === "female" ? 30 : 20} x2="100" y2={mySiba?.siba_gender === "female" ? 30 : 20} stroke="#86EFAC" strokeDasharray="4 4" />
            <line x1="0" y1={mySiba?.siba_gender === "female" ? 70 : 50} x2="100" y2={mySiba?.siba_gender === "female" ? 70 : 50} stroke="#86EFAC" strokeDasharray="4 4" />
            <path d={chartPath} fill="none" stroke="#E95B47" strokeWidth="2" />
          </svg>
        </div>

        <div className={stls.card}>
          <h3>Вакцины и обработки</h3>
          <div className={stls.row}>
            <div style={{ fontWeight: 600 }}>Препарат от паразитов</div>
            <select
              className={stls.select}
              value={drug}
              onChange={(e) => {
                const v = e.target.value;
                if (isDrugOption(v)) setDrug(v);
              }}
              disabled={health.setParasiteSettings.isPending}
            >
              {DRUG_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {drug === "Свой вариант" && (
              <>
                <Input value={customDrug} onChange={(e) => setCustomDrug(e.target.value)} placeholder="Введите препарат" />
                <Input type="number" value={cycleDaysDraft} onChange={(e) => setCycleDaysDraft(e.target.value)} placeholder="Цикл (дней)" />
              </>
            )}
            {isParasiteDirty && (
              <Button
                size="small"
                loading={health.setParasiteSettings.isPending}
                disabled={health.setParasiteSettings.isPending}
                onClick={() => {
                  health.setParasiteSettings.mutate({
                    drug_name: drug,
                    custom_drug_name: drug === "Свой вариант" ? (customDrug || null) : null,
                    taken_at: parasite.taken_at ?? null,
                    cycle_days: currentCycleDays,
                  });
                }}
              >
                Сохранить препарат
              </Button>
            )}
          </div>
          <div className={stls.grid}>
            {[
              {
                id: "rabies",
                title: "Бешенство",
                date: health.vaccQuery.data?.rabies_last_shot,
                cycle: 365,
                save: (d: string) =>
                  health.setVaccDate.mutate(
                    { key: "rabies_last_shot", date: d },
                    {
                      onSuccess: () => {
                        if (completionPercent >= 80) {
                          setToast("Твоя медкнижка заполнена на 80%! Теперь ты можешь скачать PDF-паспорт, чтобы он всегда был под рукой у врача.");
                          window.setTimeout(() => setToast(null), 2500);
                        }
                      },
                    },
                  ),
              },
              {
                id: "complex",
                title: "Комплексная",
                date: health.vaccQuery.data?.complex_last_shot,
                cycle: 365,
                save: (d: string) =>
                  health.setVaccDate.mutate(
                    { key: "complex_last_shot", date: d },
                    {
                      onSuccess: () => {
                        if (completionPercent >= 80) {
                          setToast("Твоя медкнижка заполнена на 80%! Теперь ты можешь скачать PDF-паспорт, чтобы он всегда был под рукой у врача.");
                          window.setTimeout(() => setToast(null), 2500);
                        }
                      },
                    },
                  ),
              },
              { id: "ticks", title: "Клещи", date: health.treatmentsQuery.data?.ticks_last_treatment, cycle: 30, save: (d: string) => health.setTreatmentDate.mutate({ key: "ticks_last_treatment", date: d }) },
              { id: "worms", title: "Глисты", date: health.treatmentsQuery.data?.worms_last_treatment, cycle: 90, save: (d: string) => health.setTreatmentDate.mutate({ key: "worms_last_treatment", date: d }) },
            ].map((item) => {
              const left = item.date ? Math.ceil(((new Date(`${item.date}T00:00:00`).getTime() + item.cycle * 86400000) - Date.now()) / 86400000) : -1;
              return (
                <div key={item.id} className={stls.card}>
                  <div>{item.title}</div>
                  <div className={`${stls.meta} ${left < 0 ? stls.danger : ""}`}>{left < 0 ? "Срок истек" : `Осталось ${left} дней`}</div>
                  <Input
                    type="date"
                    value={item.date ?? ""}
                    onChange={(e) => {
                      if (savingField === item.id || health.setVaccDate.isPending || health.setTreatmentDate.isPending) return;
                      setSavingField(item.id);
                      item.save(e.target.value);
                      window.setTimeout(() => setSavingField(null), 500);
                    }}
                  />
                  {(savingField === item.id || health.setVaccDate.isPending || health.setTreatmentDate.isPending) && (
                    <div className={stls.meta}>Сохраняем...</div>
                  )}
                  <Button size="small" variant="secondary" disabled>Напомнить в Telegram</Button>
                </div>
              );
            })}
          </div>
        </div>

        <div className={stls.card}>
          <h3>Аптечка</h3>
          {[
            ["enterosgel", "Энтеросгель"],
            ["chlorhexidine", "Хлоргексидин"],
            ["antihistamine", "Антигистаминное"],
            ["bandage", "Бинт"],
            ["self_fixing_patch", "Самофиксирующийся пластырь"],
          ].map(([k, label]) => (
            <div className={stls.checkItem} key={k}>
              <label><input type="checkbox" disabled={health.setFirstAid.isPending} checked={aidLocal[k as keyof typeof aidLocal]} onChange={(e) => {
                const next = { ...aidLocal, [k]: e.target.checked };
                setAidLocal(next);
                health.setFirstAid.mutate(next);
              }} /> {label}</label>
              <Button size="small" variant="secondary" disabled>Купить в 1 клик</Button>
            </div>
          ))}
          {health.setFirstAid.isPending && <div className={stls.meta}>Сохраняем аптечку...</div>}
        </div>

        <div className={stls.card}>
          <h3>Особенности</h3>
          <div className={stls.tagRow}>
            {Array.from(new Set([...(tags ?? []), ...MEDICAL_TAGS])).map((tag) => {
              const active = (tags ?? []).includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  className={`${stls.tag} ${active ? stls.tagActive : ""}`}
                  disabled={health.setMedicalId.isPending}
                  onClick={() => {
                    const base = tags ?? [];
                    const next = active ? base.filter((x) => x !== tag) : [...base, tag];
                    health.setMedicalId.mutate({ tags: next, note: health.medicalIdQuery.data?.note ?? null });
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Чип № ..."
          />
          <Button
            size="small"
            loading={health.setMedicalId.isPending}
            disabled={health.setMedicalId.isPending}
            onClick={() => {
              const text = note.trim();
              const nextTags = text ? (tags.includes(text) ? tags : [...tags, text]) : tags;
              health.setMedicalId.mutate(
                { tags: nextTags, note: null },
                {
                  onSuccess: () => {
                    setNote("");
                    setToast("Добавлено в теги медпаспорта.");
                    window.setTimeout(() => setToast(null), 1600);
                  },
                },
              );
            }}
          >
            Добавить как тег
          </Button>
        </div>
        <SibaToast text={toast} />
        {isPdfLoading && (
          <div className={stls.loadingOverlay}>
            <div className={stls.loadingCard}>Генерируем паспорт...</div>
          </div>
        )}
      </div>
    </LayoutPage>
  );
};

