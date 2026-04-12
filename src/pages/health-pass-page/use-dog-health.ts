import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../shared/api/supabase-сlient";
import type { ShibaType } from "../../shared/types";

export type WeightEntry = { id: string; measured_at: string; weight_kg: number };
export type VaccRow = { rabies_last_shot: string | null; complex_last_shot: string | null };
export type TreatRow = { ticks_last_treatment: string | null; worms_last_treatment: string | null };
export type AidRow = {
  enterosgel: boolean; chlorhexidine: boolean; antihistamine: boolean; bandage: boolean; self_fixing_patch: boolean;
};
export type MedicalIdRow = { tags: string[]; note: string | null };
export type ParasiteSettingsRow = { drug_name: string | null; custom_drug_name: string | null; taken_at: string | null; cycle_days: number | null };

const key = (sibaId?: string) => ["health-pass", sibaId ?? "none"] as const;

export const useDogHealth = (siba?: ShibaType) => {
  const sibaId = siba?.id;
  const queryClient = useQueryClient();

  const weightQuery = useQuery({
    queryKey: [...key(sibaId), "weight"],
    enabled: Boolean(sibaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_health_weight")
        .select("id,measured_at,weight_kg")
        .eq("siba_id", sibaId!)
        .order("measured_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as WeightEntry[];
    },
  });

  const vaccQuery = useQuery({
    queryKey: [...key(sibaId), "vacc"],
    enabled: Boolean(sibaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_health_vaccination")
        .select("rabies_last_shot,complex_last_shot")
        .eq("siba_id", sibaId!)
        .maybeSingle();
      if (error) throw error;
      return (data as VaccRow | null) ?? null;
    },
  });

  const treatmentsQuery = useQuery({
    queryKey: [...key(sibaId), "treatments"],
    enabled: Boolean(sibaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_health_treatments")
        .select("ticks_last_treatment,worms_last_treatment")
        .eq("siba_id", sibaId!)
        .maybeSingle();
      if (error) throw error;
      return (data as TreatRow | null) ?? null;
    },
  });

  const parasiteSettingsQuery = useQuery({
    queryKey: [...key(sibaId), "parasite-settings"],
    enabled: Boolean(sibaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_health_parasites")
        .select("drug_name,custom_drug_name,taken_at,cycle_days")
        .eq("siba_id", sibaId!)
        .maybeSingle();
      if (error) throw error;
      return (data as ParasiteSettingsRow | null) ?? null;
    },
  });

  const aidQuery = useQuery({
    queryKey: [...key(sibaId), "aid"],
    enabled: Boolean(sibaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_health_first_aid")
        .select("enterosgel,chlorhexidine,antihistamine,bandage,self_fixing_patch")
        .eq("siba_id", sibaId!)
        .maybeSingle();
      if (error) throw error;
      return (data as AidRow | null) ?? null;
    },
  });

  const medicalIdQuery = useQuery({
    queryKey: [...key(sibaId), "medical-id"],
    enabled: Boolean(sibaId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("siba_health_medical_id")
        .select("tags,note")
        .eq("siba_id", sibaId!)
        .maybeSingle();
      if (error) throw error;
      return (data as MedicalIdRow | null) ?? null;
    },
  });

  const refresh = async () => queryClient.invalidateQueries({ queryKey: key(sibaId) });

  const addWeight = useMutation({
    mutationFn: async (payload: { measured_at: string; weight_kg: number }) => {
      if (!sibaId) return;
      const { error } = await supabase.from("siba_health_weight").insert([{ siba_id: sibaId, ...payload }]);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const setVaccDate = useMutation({
    mutationFn: async (payload: { key: "rabies_last_shot" | "complex_last_shot"; date: string }) => {
      if (!sibaId) return;
      const { error } = await supabase.from("siba_health_vaccination").upsert({
        siba_id: sibaId,
        [payload.key]: payload.date || null,
      }, { onConflict: "siba_id" });
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const setTreatmentDate = useMutation({
    mutationFn: async (payload: { key: "ticks_last_treatment" | "worms_last_treatment"; date: string }) => {
      if (!sibaId) return;
      const { error } = await supabase.from("siba_health_treatments").upsert({
        siba_id: sibaId,
        [payload.key]: payload.date || null,
      }, { onConflict: "siba_id" });
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const setParasiteSettings = useMutation({
    mutationFn: async (payload: ParasiteSettingsRow) => {
      if (!sibaId) return;
      const { error } = await supabase.from("siba_health_parasites").upsert({ siba_id: sibaId, ...payload }, { onConflict: "siba_id" });
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const setFirstAid = useMutation({
    mutationFn: async (payload: AidRow) => {
      if (!sibaId) return;
      const { error } = await supabase.from("siba_health_first_aid").upsert({ siba_id: sibaId, ...payload }, { onConflict: "siba_id" });
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const setMedicalId = useMutation({
    mutationFn: async (payload: MedicalIdRow) => {
      if (!sibaId) return;
      const { error } = await supabase.from("siba_health_medical_id").upsert({ siba_id: sibaId, ...payload }, { onConflict: "siba_id" });
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const isLoading =
    weightQuery.isLoading ||
    vaccQuery.isLoading ||
    treatmentsQuery.isLoading ||
    parasiteSettingsQuery.isLoading ||
    aidQuery.isLoading ||
    medicalIdQuery.isLoading;

  const hasUrgent = useMemo(() => {
    const now = new Date().getTime();
    const toLeft = (d: string | null, days: number) => {
      if (!d) return -1;
      const due = new Date(`${d}T00:00:00`).getTime() + days * 86400000;
      return Math.ceil((due - now) / 86400000);
    };
    const left = [
      toLeft(vaccQuery.data?.rabies_last_shot ?? null, 365),
      toLeft(vaccQuery.data?.complex_last_shot ?? null, 365),
      toLeft(treatmentsQuery.data?.ticks_last_treatment ?? null, 30),
      toLeft(treatmentsQuery.data?.worms_last_treatment ?? null, 90),
    ];
    return left.some((x) => x <= 14);
  }, [vaccQuery.data, treatmentsQuery.data]);

  return {
    weightQuery, vaccQuery, treatmentsQuery, parasiteSettingsQuery, aidQuery, medicalIdQuery,
    addWeight, setVaccDate, setTreatmentDate, setParasiteSettings, setFirstAid, setMedicalId,
    isLoading, hasUrgent,
  };
};

