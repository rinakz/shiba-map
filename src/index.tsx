import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import "./styles/base.sass";
import { App } from "./app";
import { AppProvider } from "./shared/context/app-context";
import { CommunityPreviewDrawerProvider } from "./shared/context/community-preview-drawer-provider";
import { queryClient } from "./shared/api/query-client";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <QueryClientProvider client={queryClient}>
  <AppProvider>
    <CommunityPreviewDrawerProvider>
      <App />
    </CommunityPreviewDrawerProvider>
  </AppProvider>
  </QueryClientProvider>
);
