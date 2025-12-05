import ReactDOM from "react-dom/client";
import "./styles/base.sass";
import { App } from "./app";
import { AppProvider } from "./components/context/app-context";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <AppProvider>
    <App />
  </AppProvider>
);
