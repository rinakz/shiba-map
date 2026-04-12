import type { SibaStatus } from "../../shared/types";

/** Суффиксы для `siba.module.sass`: `statusWalk`, `statusCapsuleWalk`, `statusDotWalk`, … */
export const SIBA_STATUS_CLASS_SUFFIX: Record<SibaStatus, string> = {
  walk: "Walk",
  training: "Training",
  angry: "Angry",
  heat: "Heat",
  sick: "Sick",
  girls_only: "GirlsOnly",
  boys_only: "BoysOnly",
};

export const SIBA_KNOWN_COMMANDS_PREVIEW_LIMIT = 8;

export const NESTED_SIBA_DRAWER_PAPER_SX = {
  height: "auto",
  maxHeight: "90dvh",
  overflowY: "auto",
  overscrollBehavior: "contain",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  padding: "12px",
} as const;

export const NESTED_SIBA_DIALOG_PAPER_SX = {
  borderRadius: 2,
  maxHeight: "90dvh",
  overflowY: "auto",
  padding: "12px",
} as const;
