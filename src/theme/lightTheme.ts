import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#93caed", // Softer chill blue
      light: "#A3C0E0", // Lighter variant for hover effects
      dark: "#5C7991", // Darker variant for contrast
    },
    secondary: {
      main: "#000000", // Warm and inviting
      light: "#E7B9A5",
      dark: "#A05A4A",
    },
    success: {
      main: "#A3BE8C", // Natural and balanced
      light: "#C1D7AC",
      dark: "#7E9C6D",
    },
    warning: {
      main: "#EBCB8B", // Curious gold
      light: "#F1D9A4",
      dark: "#B99765",
    },
    error: {
      main: red.A400,
      light: "#FF867C",
      dark: "#C62828",
    },
    background: {
      default: "#FFFFFF", // Softer off-white
      paper: "#FFFFFF", // Crisp white for cards
    },
    text: {
      primary: "#2E3440", // Strong readability
      secondary: "#4C566A", // Subtle secondary text
    },
  },
  typography: {
    fontFamily: ["Poppins", '"Helvetica Neue"', "Arial", "sans-serif"].join(
      ","
    ),
    button: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none",
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #EAEAEA",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 6,
          transition: "0.3s ease-in-out",
          "&:hover": {
            opacity: 0.9,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#D1D9E6",
            },
            "&:hover fieldset": {
              borderColor: "#81A1C1",
            },
          },
        },
      },
    },
  },
});

export default lightTheme;
