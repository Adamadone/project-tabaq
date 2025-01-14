import "./index.css";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.jsx";

if (
  import.meta.env.VITE_UMAMI_SCRIPT_URL &&
  import.meta.env.VITE_UMAMI_WEBSITE_ID
) {
  const s = document.createElement("script");
  s.setAttribute("defer", "");
  s.setAttribute("src", import.meta.env.VITE_UMAMI_SCRIPT_URL);
  s.setAttribute("data-website-id", import.meta.env.VITE_UMAMI_WEBSITE_ID);
  document.body.appendChild(s);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
