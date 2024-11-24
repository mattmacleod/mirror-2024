import "vite/modulepreload-polyfill";
import "./index.css";

import App from "components/App";
import { createRoot } from "react-dom/client";

const rootElement = document.getElementById("AppRoot");
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(advancedFormat);
dayjs.extend(relativeTime);
