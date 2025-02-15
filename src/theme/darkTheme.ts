import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff", // Pure black primary
    },
    secondary: {
      main: "#f0f0f0", // Deep black secondary
    },
    success: {
      main: "#1E1E1E",
    },
    warning: {
      main: "#252525",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#000000", // Fully black background
      paper: "#121212", // Slightly lighter black for contrast
    },
    text: {
      primary: "#FFFFFF", // Pure white text for contrast
      secondary: "#B0B0B0", // Softer gray for secondary text
    },
  },
  typography: {
    fontFamily: ["Poppins", '"Helvetica Neue"', "Arial", "sans-serif"].join(
      ","
    ),
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          backgroundColor: "#000000",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
  },
});

export default darkTheme;
