import React, { useState, useContext } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Menu,
  MenuItem,
  IconButton,
  useTheme,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { ColorModeContext } from "../../ColorModeContext";

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, onLogout }) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        borderBottom: "0px solid #ccc",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left Side: Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img
            src="/icon.png"
            alt="Penguin Logo"
            style={{ width: 60, height: 60 }}
          />
        </Box>

        {/* Center Links: Only main collection routes */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
            flexGrow: 1,
          }}
        >
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Home
          </Button>
          <Button
            component={Link}
            to="/projects"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Forge
          </Button>
          <Button
            component={Link}
            to="/categories"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Archives
          </Button>
          <Button
            component={Link}
            to="/meetup"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Gatherings
          </Button>
          <Button
            component={Link}
            to="/resources"
            color="inherit"
            sx={{ textTransform: "none" }}
          >
            Vault
          </Button>
        </Box>

        {/* Right Side: Settings Dropdown */}
        <Box>
          {isLoggedIn && (
            <>
              <IconButton
                onClick={handleMenuOpen}
                color="inherit"
                sx={{ textTransform: "none" }}
              >
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                sx={{ boxShadow: "none" }}
              >
                <MenuItem onClick={() => navigate("/profile")}>
                  My Profile
                </MenuItem>
                <MenuItem onClick={() => navigate("/settings")}>
                  Account Settings
                </MenuItem>
                <MenuItem
                  sx={{ color: theme.palette.error.main }}
                  onClick={handleLogout}
                >
                  Logout
                </MenuItem>
                <MenuItem>
                  <IconButton onClick={toggleColorMode} color="inherit">
                    {mode === "light" ? <Brightness7 /> : <Brightness4 />}
                  </IconButton>
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
