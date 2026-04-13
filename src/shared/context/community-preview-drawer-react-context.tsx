import { createContext, useContext } from "react";
import type { CommunityPreviewDrawerContextValue } from "../types/community-preview-drawer.types";

export const CommunityPreviewDrawerContext =
  createContext<CommunityPreviewDrawerContextValue | null>(null);

export function useCommunityPreviewDrawer(): CommunityPreviewDrawerContextValue {
  const ctx = useContext(CommunityPreviewDrawerContext);
  if (!ctx) {
    throw new Error("CommunityPreviewDrawerProvider is missing");
  }
  return ctx;
}
