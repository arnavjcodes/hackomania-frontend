import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./components/App";
import reportWebVitals from "./reportWebVitals";
import axios from "axios";
import { ColorModeContextProvider } from "./ColorModeContext";
import CssBaseline from "@mui/material/CssBaseline";
axios.defaults.baseURL = "http://localhost:3000";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ColorModeContextProvider>
      {/* CssBaseline to apply base styles like body margin=0, etc. */}
      <CssBaseline />
      <App />
    </ColorModeContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
