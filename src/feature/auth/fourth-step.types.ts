import type { AccountType, AuthFormType } from "../../pages/auth-page/types";

export type MapActionTick = {
  globalPixelCenter: [number, number];
  zoom: number;
};

export type MapTargetPayload = {
  options: {
    get: (name: "projection") => {
      fromGlobalPixels: (
        globalPixelCenter: [number, number],
        zoom: number,
      ) => [number, number];
    };
  };
};

export interface MapActionTickEvent {
  get(key: "target"): MapTargetPayload;
  get(key: "tick"): MapActionTick;
}

export interface FourthStepProps {
  setActiveStep: (value: number) => void;
  formData: AuthFormType;
  authMethod: "email" | "telegram";
  accountType?: AccountType;
  kennelLogoFile?: File | null;
}
