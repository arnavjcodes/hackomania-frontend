import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/system";
import Navbar from "../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

interface UserData {
  name: string;
  email?: string | null;
  bio?: string;
}

const SettingsPage: React.FC = () => {
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: null,
    bio: "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery((theme: any) =>
    theme.breakpoints.down("sm")
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/v1/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = response.data;
        setUserData({
          name: data.name || "",
          email: data.email || null,
          bio: data.bio || "",
        });
      } catch (error: any) {
        console.error("Error fetching user data:", error);

        if (axios.isAxiosError(error)) {
          if (error.response) {
            if (error.response.status === 401) {
              localStorage.removeItem("token");
              navigate("/login");
            }
            alert(
              error.response.data.message || "Failed to load user settings"
            );
          } else if (error.request) {
            alert("No response from server. Please try again later.");
          } else {
            alert("An unexpected error occurred.");
          }
        } else {
          alert("Failed to load user settings");
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch(
        "/api/v1/user",
        {
          user: {
            ...userData,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Settings saved successfully!");
    } catch (error: any) {
      console.error("Save error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          const errorMessage =
            error.response.data.errors?.join(", ") || "Failed to save settings";
          alert(errorMessage);
        } else if (error.request) {
          alert("No response from server. Please try again later.");
        } else {
          alert("An unexpected error occurred.");
        }
      } else {
        alert("Failed to save settings");
      }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete("/api/v1/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.removeItem("token");
      navigate("/login");
      alert("Account deleted successfully");
    } catch (error: any) {
      console.error("Deletion error:", error);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          alert(error.response.data.message || "Failed to delete account");
        } else if (error.request) {
          alert("No response from server. Please try again later.");
        } else {
          alert("An unexpected error occurred.");
        }
      } else {
        alert("Failed to delete account");
      }
    }
  };

  return (
    <>
      <Navbar
        isLoggedIn={true}
        onLogout={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      />

      <Box sx={{ maxWidth: 800, mx: "auto", mt: 4, p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Account Settings
        </Typography>

        {/* Profile Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
            Profile
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={userData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={userData.email || ""}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                multiline
                rows={3}
                value={userData.bio || ""}
                onChange={handleInputChange}
                helperText="Tell us about yourself"
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Danger Zone */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 500, color: "error.main" }}
          >
            Danger Zone
          </Typography>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Account
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This will permanently delete your account and all associated data
          </Typography>
        </Box>

        {/* Save Button */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSave}
            size="large"
            sx={{ px: 4, textTransform: "none" }}
          >
            Save Changes
          </Button>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Account?</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to permanently delete your account? This
              action:
            </Typography>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li>Will remove all your data</li>
              <li>Cannot be undone</li>
              <li>Will delete all your content</li>
            </ul>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={handleDeleteAccount}
            >
              Confirm Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default SettingsPage;
