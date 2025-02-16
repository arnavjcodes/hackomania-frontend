// src/pages/ResourceDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  CircularProgress,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { ArrowBack, Star, Visibility } from "@mui/icons-material";
import Navbar from "../components/layout/Navbar";

interface User {
  id: number;
  username: string;
  name: string | null;
}

interface Tag {
  id: number;
  name: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  content: string;
  resource_type: string;
  url: string;
  published: boolean;
  approved: boolean;
  view_count: number;
  rating: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: User;
  tags: Tag[];
}

// Neon flicker animation
const flicker = keyframes`
  0% { opacity: 0.95; }
  5% { opacity: 0.85; }
  10% { opacity: 0.9; }
  15% { opacity: 0.92; }
  100% { opacity: 0.95; }
`;

const NeonBackground = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background:
    theme.palette.mode === "dark"
      ? "radial-gradient(circle at center, #111 0%, #000 80%)"
      : "linear-gradient(to bottom, #ffffff, #f5f5f5)",
  animation: `${flicker} 4s infinite alternate`,
  color: theme.palette.text.primary,
}));

const NeonTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Press Start 2P", monospace',
  fontWeight: 700,
  letterSpacing: "1px",
  marginBottom: theme.spacing(2),
  color: "#0ff",
  textShadow: `
    0 0 2px #0ff,
    0 0 5px #0ff,
    0 0 10px #0ff
  `,
  transition: "text-shadow 0.2s ease-in-out",
  "&:hover": {
    textShadow: `
      0 0 3px #0ff,
      0 0 7px #0ff,
      0 0 12px #0ff
    `,
  },
}));

const MarkdownContainer = styled(Box)(({ theme }) => ({
  fontFamily: "Consolas, 'Courier New', monospace",
  lineHeight: 1.7,
  fontSize: "0.95rem",
  wordBreak: "break-word",
  overflowWrap: "anywhere",
  padding: theme.spacing(2),
  backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#ffffff",
  borderRadius: theme.shape.borderRadius,
}));

const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/v1/resources/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResource(res.data);
      } catch (err) {
        console.error("Error fetching vault item:", err);
        setError("Failed to load Vault item.");
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  if (loading) {
    return (
      <NeonBackground
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <CircularProgress color="primary" />
      </NeonBackground>
    );
  }

  if (error || !resource) {
    return (
      <NeonBackground
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography color="error" variant="h6">
          {error || "Vault item not found."}
        </Typography>
      </NeonBackground>
    );
  }

  return (
    <NeonBackground>
      <Navbar isLoggedIn onLogout={() => navigate("/login")} />
      <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 4 } }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{
            mb: 3,
            color: "#0ff",
            borderColor: "#0ff",
            "&:hover": {
              borderColor: "#88f",
              color: "#88f",
            },
          }}
        >
          Back
        </Button>

        <Card
          sx={{
            mb: 4,
            bgcolor: "background.paper",
            boxShadow: 4,
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #333",
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <NeonTitle variant="h3">{resource.title}</NeonTitle>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Chip
                label={resource.resource_type}
                sx={{
                  fontWeight: 700,
                  backgroundColor: "#0ff",
                  color: "#000",
                  "&:hover": { opacity: 0.9 },
                }}
              />
              <Chip
                icon={<Star sx={{ fontSize: "1rem" }} />}
                label={`Rating: ${resource.rating}`}
                sx={{
                  backgroundColor: "#222",
                  color: "#0ff",
                  "& svg": { color: "#ff0" },
                }}
              />
              <Chip
                icon={<Visibility sx={{ fontSize: "1rem" }} />}
                label={`Views: ${resource.view_count}`}
                sx={{
                  backgroundColor: "#222",
                  color: "#0ff",
                  "& svg": { color: "#0f0" },
                }}
              />
            </Stack>

            <Divider sx={{ mb: 3, borderColor: "#444" }} />

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ mb: 3 }}
            >
              <Avatar
                sx={{
                  bgcolor: "#0ff",
                  width: 56,
                  height: 56,
                  fontSize: "1.5rem",
                  color: "#000",
                }}
              >
                {resource.user.name
                  ? resource.user.name.charAt(0)
                  : resource.user.username.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {resource.user.name || resource.user.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(resource.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 3, borderColor: "#444" }} />

            <MarkdownContainer>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {resource.content || resource.description}
              </ReactMarkdown>
            </MarkdownContainer>

            {resource.tags.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 4, flexWrap: "wrap" }}
              >
                {resource.tags.map((tag) => (
                  <Chip
                    key={tag.id}
                    label={`#${tag.name}`}
                    sx={{
                      backgroundColor: "#333",
                      color: "#0ff",
                      fontWeight: 500,
                      "&:hover": { opacity: 0.8 },
                    }}
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </NeonBackground>
  );
};

export default ResourceDetailPage;
