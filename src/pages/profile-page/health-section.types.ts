export type AccordionKey = "vaccination" | "parasites";

export type VaccineKey = "rabies" | "complex";

export type DrugOption = "Bravecto" | "Simparica" | "Milbemax" | "Свой вариант";

export type HealthSectionProps = {
  sibaId?: string;
};

export type VaccineRow = {
  siba_id: string;
  rabies_last_shot: string | null;
  complex_last_shot: string | null;
};

export type ParasiteRow = {
  siba_id: string;
  drug_name: string | null;
  custom_drug_name: string | null;
  taken_at: string | null;
  cycle_days: number | null;
};

export type VaccineStatus = {
  nextDue: Date;
  leftDays: number;
  isExpired: boolean;
} | null;

export type ParasiteProgress = {
  progress: number;
  leftDays: number | null;
};
