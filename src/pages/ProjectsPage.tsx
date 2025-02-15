// src/pages/ProjectsPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  TextField,
  InputAdornment,
  SpeedDial,
  SpeedDialAction,
  Chip,
} from "@mui/material";
import {
  Search as SearchIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Terminal as TerminalIcon,
} from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import CodeIcon from "@mui/icons-material/Code";
import LanguageIcon from "@mui/icons-material/Language";

import Navbar from "../components/layout/Navbar";
import NewProjectDialog from "../components/NewProjectDialog";

// ---------- TYPES / INTERFACES ----------
interface User {
  id: number;
  username: string;
  name: string | null;
}

interface Project {
  id: number;
  title: string;
  description: string;
  repo_link?: string;
  live_site_link?: string;
  created_at: string;
  user: User;
  comments_count: number;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newProjectOpen, setNewProjectOpen] = useState(false);

  // Fetch all projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Adjust if your API returns { projects: [...] }:
        // setProjects(res.data.projects || []);
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Filter by title/description
  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar isLoggedIn onLogout={() => navigate("/login")} />

      <Box sx={{ p: 4 }}>
        {/* Title with a geeky icon */}
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{ mb: 4, fontFamily: "'Ubuntu Mono', monospace" }}
        >
          <TerminalIcon color="primary" />
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Explore Projects
          </Typography>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            mb: 4,
            "& .MuiInputBase-input": {
              fontFamily: "'Ubuntu Mono', monospace",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {filteredProjects.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", color: "text.secondary" }}
          >
            No projects found{searchQuery ? " matching your search" : ""}.
          </Typography>
        ) : (
          filteredProjects.map((project) => (
            <Card
              key={project.id}
              sx={{
                mb: 3,
                borderRadius: 2,
                boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                borderLeft: "6px solid #8fbcbb", // a "geeky" accent color
                cursor: "pointer",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                },
                fontFamily: "'Ubuntu Mono', monospace",
              }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardContent>
                {/* Project Owner */}
                <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                  Created by {project.user?.name || project.user?.username}
                </Typography>

                {/* Project Title */}
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", mb: 1, fontFamily: "inherit" }}
                >
                  {project.title}
                </Typography>

                {/* Description Snippet */}
                <Typography
                  variant="body1"
                  sx={{ mb: 2, fontFamily: "inherit" }}
                >
                  {project.description}
                </Typography>

                {/* Repo & Live links as chips, if they exist */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                  {project.repo_link && (
                    <Chip
                      icon={<CodeIcon />}
                      label="Repository"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(project.repo_link, "_blank");
                      }}
                      sx={{ fontFamily: "inherit", cursor: "pointer" }}
                    />
                  )}
                  {project.live_site_link && (
                    <Chip
                      icon={<LanguageIcon />}
                      label="Live Site"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(project.live_site_link, "_blank");
                      }}
                      sx={{ fontFamily: "inherit", cursor: "pointer" }}
                    />
                  )}
                </Box>

                {/* Comment Count */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ChatBubbleOutlineIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontFamily: "inherit" }}>
                    {project.comments_count} comments
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>

      {/* Speed Dial for new project (and any other actions you want) */}
      <SpeedDial
        ariaLabel="Create new items"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        icon={<AddIcon />}
        direction="up"
      >
        <SpeedDialAction
          icon={<CodeIcon />}
          tooltipTitle="New Project"
          onClick={() => setNewProjectOpen(true)}
        />
        {/* Add more SpeedDialAction items here if desired */}
      </SpeedDial>

      {/* Dialog for New Project */}
      <NewProjectDialog
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />
    </>
  );
};

export default ProjectsPage;
