// ColorModeContext.tsx
import React, { createContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "./theme/lightTheme";
import darkTheme from "./theme/darkTheme";

type ColorMode = "light" | "dark";

interface ColorModeContextProps {
  mode: ColorMode;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeContextProps>({
  mode: "light",
  toggleColorMode: () => {},
});

interface Props {
  children: React.ReactNode;
}

export const ColorModeContextProvider: React.FC<Props> = ({ children }) => {
  // 1) Initialize the state from localStorage (default to "light" if none found)
  const [mode, setMode] = useState<ColorMode>(() => {
    const storedMode = localStorage.getItem("colorMode");
    return storedMode === "dark" ? "dark" : "light";
  });

  // 2) Whenever mode changes, store it in localStorage
  useEffect(() => {
    localStorage.setItem("colorMode", mode);
  }, [mode]);

  // 3) Toggle function
  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // 4) Choose the MUI theme object based on “mode”
  const theme = useMemo(() => {
    return mode === "light" ? lightTheme : darkTheme;
  }, [mode]);

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
