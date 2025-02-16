// src/pages/CreateResourcePage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Paper,
} from "@mui/material";
import Navbar from "../components/layout/Navbar";
import FullScreenMarkdownEditor from "../components/FullScreenMarkdownEditor";

const resourceTypes = [
  { value: "Algorithm", label: "Algorithm" },
  { value: "Setup Guide", label: "Setup Guide" },
  { value: "Insight", label: "Insight" },
  { value: "Software", label: "Software" },
];

const CreateResourcePage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState("");
  const [resourceType, setResourceType] = useState(resourceTypes[0].value);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [url, setUrl] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Handle tag addition
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Toggle preview mode for Markdown description
  const handleTogglePreview = (
    event: React.MouseEvent<HTMLElement>,
    newMode: boolean | null
  ) => {
    if (newMode !== null) {
      setIsPreview(newMode);
    }
  };

  // Handle vault submission
  const handleSubmit = async () => {
    setCreating(true);
    setError(null);

    const payload = {
      resource: {
        title,
        resource_type: resourceType,
        description: "",
        content: markdown, // We’re sending the markdown as description
        url,
        // For simplicity, we're sending tag names; you might need to map these to tag IDs on the backend.
        tag_ids: [1, 2],
        published: true,
        approved: false, // Pending moderation
      },
    };

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/api/v1/resources", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("response", res);
      navigate("/resources"); // Navigate to vault list after success
    } catch (err: any) {
      console.error("Error creating vault item:", err);
      setError("Failed to create vault item. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Navbar isLoggedIn onLogout={() => navigate("/login")} />
      <Box sx={{ maxWidth: 800, mx: "auto", p: 4 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: "bold",
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          Create New Vault Item
        </Typography>

        {/* Title */}
        <TextField
          fullWidth
          variant="outlined"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Vault Type */}
        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="resource-type-label">Vault Type</InputLabel>
          <Select
            labelId="resource-type-label"
            label="Vault Type"
            value={resourceType}
            onChange={(e) => setResourceType(e.target.value)}
          >
            {resourceTypes.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tags */}
        <Box sx={{ mb: 3 }}>
          <TextField
            variant="outlined"
            label="Add Tag"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTag();
              }
            }}
            sx={{ width: "70%", mr: 2 }}
          />
          <Button variant="outlined" onClick={handleAddTag}>
            Add Tag
          </Button>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                color="primary"
              />
            ))}
          </Stack>
        </Box>

        {/* URL */}
        <TextField
          fullWidth
          variant="outlined"
          label="External URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Markdown Editor Section */}
        <Box sx={{ mb: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={1}
          >
            <Typography
              variant="h6"
              sx={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              Description (Markdown)
            </Typography>
            <ToggleButtonGroup
              value={isPreview}
              exclusive
              onChange={handleTogglePreview}
              size="small"
            >
              <ToggleButton value={false}>Edit</ToggleButton>
              <ToggleButton value={true}>Preview</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" onClick={() => setIsFullScreen(true)}>
              Full Screen Editor
            </Button>
          </Box>
          {isPreview ? (
            <Paper
              variant="outlined"
              sx={{ p: 2, minHeight: 200, bgcolor: "background.paper" }}
            >
              {markdown.trim() ? (
                <ReactMarkdown>{markdown}</ReactMarkdown>
              ) : (
                <Typography color="text.secondary" fontStyle="italic">
                  Nothing to preview.
                </Typography>
              )}
            </Paper>
          ) : (
            <TextField
              fullWidth
              variant="outlined"
              multiline
              minRows={10}
              placeholder="Write your vault item description in markdown..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
              }}
            />
          )}
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={creating || !title.trim() || !markdown.trim()}
            sx={{ py: 1.5, px: 3, fontWeight: 600, borderRadius: 2 }}
          >
            {creating ? "Creating..." : "Create Vault Item"}
          </Button>
        </Box>
      </Box>

      {/* Full Screen Markdown Editor */}
      {isFullScreen && (
        <FullScreenMarkdownEditor
          initialMarkdown={markdown}
          onChange={(md) => setMarkdown(md)}
          onClose={() => setIsFullScreen(false)}
        />
      )}
    </Box>
  );
};

export default CreateResourcePage;
