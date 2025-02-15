// src/theme.ts

import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

/**
 * You can augment the Palette to hold your extra “mood” or “brand” colors,
 * or simply store them in theme.palette.primary, secondary, error, etc.
 */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#88c0d0", // "chill" color
    },
    secondary: {
      main: "#bf616a", // "excited" color
    },
    success: {
      main: "#a3be8c", // "supportive"
    },
    warning: {
      main: "#ebcb8b", // "curious"
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fafafa", // previously #fafafa
      paper: "#ffffff",
    },
    text: {
      primary: "#2e3440", // a darker neutral color
      secondary: "#4c566a",
    },
  },
  typography: {
    // Example typography changes
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    // etc...
  },
  shape: {
    borderRadius: 8, // Rounded corners globally
  },
  components: {
    // Here you can override default MUI component styles globally
    MuiAppBar: {
      styleOverrides: {
        root: {
          // Example: remove box shadow or set a background
          boxShadow: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none", // remove all caps transform
          borderRadius: 8,
        },
      },
    },
    // etc.
  },
});

export default theme;
