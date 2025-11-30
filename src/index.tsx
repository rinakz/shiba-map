import { createRoot } from "react-dom/client";
import "./styles/base.sass";
import { App } from "./app";

const container = document.getElementById("root")!;

const root = createRoot(container);

root.render(<App />);
