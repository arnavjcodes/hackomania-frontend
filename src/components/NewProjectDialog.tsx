// NewProjectDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  styled,
  useTheme,
} from "@mui/material";
import axios from "axios";

// -- STYLED COMPONENTS --

const GeekyDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontWeight: "bold",
  fontFamily: "'Ubuntu Mono', monospace",
  background: "linear-gradient(90deg, #2e3440 0%, #3b4252 100%)",
  color: "#88c0d0",
  position: "relative",
  // Add a little terminal-like underscore that blinks:
  "&::after": {
    content: '"_"',
    position: "absolute",
    marginLeft: "4px",
    fontWeight: "normal",
    color: "#88c0d0",
    animation: "blink 1s steps(2, start) infinite",
  },
  "@keyframes blink": {
    "0%": { opacity: 1 },
    "50%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
}));

// A little monospaced style for the input fields
const GeekyTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    fontFamily: "'Ubuntu Mono', monospace",
  },
}));

const GeekyDialogActions = styled(DialogActions)(({ theme }) => ({
  justifyContent: "space-between",
  backgroundColor: theme.palette.mode === "dark" ? "#3b4252" : "#f5f5f5",
}));

// -- MAIN COMPONENT --

function NewProjectDialog({ open, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [liveSiteLink, setLiveSiteLink] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/v1/projects",
        {
          project: {
            title,
            description,
            repo_link: repoLink,
            live_site_link: liveSiteLink,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Project created:", response.data);

      // Clear the form and close the dialog
      setTitle("");
      setDescription("");
      setRepoLink("");
      setLiveSiteLink("");
      onClose();
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      // Blurred backdrop
      BackdropProps={{
        style: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      {/* Terminal-like Title */}
      <GeekyDialogTitle>New Project</GeekyDialogTitle>

      <DialogContent dividers sx={{ bgcolor: "#eceff4" }}>
        {error && (
          <Typography
            color="error"
            sx={{ mb: 2, fontFamily: "'Ubuntu Mono', monospace" }}
          >
            {error}
          </Typography>
        )}

        <GeekyTextField
          label="Project Title"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <GeekyTextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          sx={{ mb: 2 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <GeekyTextField
          label="Repository Link"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={repoLink}
          onChange={(e) => setRepoLink(e.target.value)}
        />

        <GeekyTextField
          label="Live Site Link"
          variant="outlined"
          fullWidth
          value={liveSiteLink}
          onChange={(e) => setLiveSiteLink(e.target.value)}
        />
      </DialogContent>

      <GeekyDialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateProject}
          disabled={loading}
          sx={{
            bgcolor: "#8fbcbb",
            color: "white",
            fontFamily: "'Ubuntu Mono', monospace",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#88c0d0" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Create Project"
          )}
        </Button>
      </GeekyDialogActions>
    </Dialog>
  );
}

export default NewProjectDialog;
