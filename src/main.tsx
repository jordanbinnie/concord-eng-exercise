// App entry point.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApiProvider } from "@/components/api-provider";
import App from "./app";
import { TooltipProvider } from "./components/ui/tooltip";
import "./index.css";

// biome-ignore lint/style/noNonNullAssertion: root element is guaranteed to exist in index.html
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <ApiProvider>
        <App />
      </ApiProvider>
    </TooltipProvider>
  </StrictMode>
);
