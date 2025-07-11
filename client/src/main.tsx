import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./theme-fix.css";
import "./force-theme.css";
import "./modal-theme.css";
import "./modal-override.css";
import "./final-theme.css";

createRoot(document.getElementById("root")!).render(<App />);
