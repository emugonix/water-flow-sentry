import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Disable context menu for simulating hardware environment
document.addEventListener("contextmenu", (e) => e.preventDefault());

createRoot(document.getElementById("root")!).render(<App />);
