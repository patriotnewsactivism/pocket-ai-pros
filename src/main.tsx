import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { injectRuntimeEnv } from "./config/runtime-env.ts";

injectRuntimeEnv();

createRoot(document.getElementById("root")!).render(<App />);
