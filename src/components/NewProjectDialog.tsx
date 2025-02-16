// src/components/NewProjectDialog.jsx
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

// Use the theme's primary color for the dialog title
const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  fontWeight: "bold",
  fontFamily: "'Ubuntu Mono', monospace",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(2),
}));

// Simple monospaced text field styling
const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    fontFamily: "'Ubuntu Mono', monospace",
  },
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  justifyContent: "flex-end",
  padding: theme.spacing(2),
}));

// -- MAIN COMPONENT --
function NewProjectDialog({ open, onClose }: any) {
  // Basic fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repoLink, setRepoLink] = useState("");
  const [liveSiteLink, setLiveSiteLink] = useState("");
  // New optional fields
  const [techStack, setTechStack] = useState("");
  const [schemaUrl, setSchemaUrl] = useState("");
  const [flowchartUrl, setFlowchartUrl] = useState("");
  // Optional collaborators: comma-separated list of collaborator IDs
  const [collaboratorsInput, setCollaboratorsInput] = useState("");

  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      // Create forge with all fields
      const response = await axios.post(
        "/api/v1/projects",
        {
          project: {
            title,
            description,
            repo_link: repoLink,
            live_site_link: liveSiteLink,
            tech_stack: techStack,
            schema_url: schemaUrl,
            flowchart_url: flowchartUrl,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const createdProject = response.data.project;
      console.log("Forge created:", createdProject);

      // If collaborator IDs were provided, add each one.
      if (collaboratorsInput.trim()) {
        const collaboratorIds = collaboratorsInput
          .split(",")
          .map((id) => id.trim())
          .filter((id) => id !== "");
        for (const collaboratorId of collaboratorIds) {
          await axios.post(
            `/api/v1/projects/${createdProject.id}/add_collaborator`,
            { collaborator_id: collaboratorId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
      // Clear the form and close the dialog
      setTitle("");
      setDescription("");
      setRepoLink("");
      setLiveSiteLink("");
      setTechStack("");
      setSchemaUrl("");
      setFlowchartUrl("");
      setCollaboratorsInput("");
      onClose();
    } catch (err) {
      console.error("Error creating forge:", err);
      setError("Failed to create forge. Please try again.");
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
      BackdropProps={{
        style: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <StyledDialogTitle>New Forge</StyledDialogTitle>
      <DialogContent dividers>
        {error && (
          <Typography
            color="error"
            sx={{ mb: 2, fontFamily: "'Ubuntu Mono', monospace" }}
          >
            {error}
          </Typography>
        )}

        <StyledTextField
          label="Forge Title"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <StyledTextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          sx={{ mb: 2 }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <StyledTextField
          label="Repository Link"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={repoLink}
          onChange={(e) => setRepoLink(e.target.value)}
        />

        <StyledTextField
          label="Live Site Link"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={liveSiteLink}
          onChange={(e) => setLiveSiteLink(e.target.value)}
        />

        <StyledTextField
          label="Tech Stack"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="e.g., Ruby, Rails, React"
        />

        <StyledTextField
          label="Schema URL"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={schemaUrl}
          onChange={(e) => setSchemaUrl(e.target.value)}
          placeholder="Link to schema image or PDF"
        />

        <StyledTextField
          label="Flowchart URL"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={flowchartUrl}
          onChange={(e) => setFlowchartUrl(e.target.value)}
          placeholder="Link to flowchart image or PDF"
        />

        <StyledTextField
          label="Collaborators (comma-separated user IDs)"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={collaboratorsInput}
          onChange={(e) => setCollaboratorsInput(e.target.value)}
          placeholder="e.g., 3, 7, 12"
        />
      </DialogContent>

      <StyledDialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateProject}
          disabled={loading}
          sx={{
            fontFamily: "'Ubuntu Mono', monospace",
            fontWeight: "bold",
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Create Forge"
          )}
        </Button>
      </StyledDialogActions>
    </Dialog>
  );
}

export default NewProjectDialog;
