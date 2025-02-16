import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "../routes";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ChatWidget from "./ChatWidget";

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    alert("You have been logged out.");
  };

  return (
    <Router>
      <ChatWidget />
      <AppRoutes token={token} setToken={setToken} logout={handleLogout} />
    </Router>
  );
};

export default App;
