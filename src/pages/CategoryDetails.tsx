import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Button,
  SpeedDial,
  SpeedDialAction,
} from "@mui/material";
import {
  ArrowBack,
  Search,
  Favorite,
  FavoriteBorder,
  Spa,
} from "@mui/icons-material";
import Navbar from "../components/layout/Navbar";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import ForumIcon from "@mui/icons-material/Forum";

import NewPostDialog from "../components/NewPostDialog";
import NewCategoryDialog from "../components/NewCategoryDialog";

interface ForumThread {
  id: number;
  title: string;
  content: string;
  mood: string;
  likes_count: number;
  chill_votes_count: number;
  comments_count: number;
  user: {
    id: number;
    username: string;
    name: string | null;
  };
  created_at: string;
  user_liked: boolean;
  user_chilled: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

const moodColors: Record<string, string> = {
  chill: "#88c0d0",
  excited: "#bf616a",
  curious: "#ebcb8b",
  supportive: "#a3be8c",
  casual: "#d08770",
};

const CategoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/v1/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCategory(res.data.category);
        setThreads(res.data.forum_threads);
      } catch (err) {
        console.error("Error fetching archive:", err);
        setError("Failed to load archive data");
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [id]);

  const handleLike = async (threadId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `/api/v1/forum_threads/${threadId}/toggle_like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, ...res.data } : t))
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleChill = async (threadId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `/api/v1/forum_threads/${threadId}/toggle_chill`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, ...res.data } : t))
      );
    } catch (err) {
      console.error("Error toggling chill:", err);
    }
  };

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/categories")}
          sx={{ mb: 4 }}
        >
          Back to Archives
        </Button>

        {category && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: "bold" }}>
              {category.name}
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", maxWidth: "800px" }}
            >
              {category.description || "No description available"}
            </Typography>
          </Box>
        )}

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search threads in this archive..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        {filteredThreads.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", color: "text.secondary" }}
          >
            No threads found
            {searchQuery ? " matching your search" : " in this archive"}
          </Typography>
        ) : (
          filteredThreads.map((thread) => {
            const moodColor = moodColors[thread.mood] || "#ccc";
            return (
              <Card
                key={thread.id}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                  borderLeft: `6px solid ${moodColor}`,
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    transition: "transform 0.2s",
                  },
                }}
                onClick={() => navigate(`/forum_threads/${thread.id}`)}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                    Posted by {thread.user?.name || thread.user?.username}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                    {thread.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {thread.content}
                  </Typography>

                  <Box
                    sx={{ display: "flex", gap: 3, alignItems: "center" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(thread.id);
                        }}
                        sx={{
                          color: thread.user_liked ? "error.main" : "inherit",
                        }}
                      >
                        {thread.user_liked ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                      <Typography>{thread.likes_count}</Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChill(thread.id);
                        }}
                        sx={{
                          color: thread.user_chilled ? "#88c0d0" : "inherit",
                        }}
                      >
                        <Spa />
                      </IconButton>
                      <Typography>{thread.chill_votes_count}</Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        {new Date(thread.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
      <SpeedDial
        ariaLabel="Create new items"
        sx={{ position: "fixed", bottom: 24, right: 24 }}
        icon={<AddIcon />}
        direction="up"
      >
        <SpeedDialAction
          icon={<ForumIcon />}
          tooltipTitle="New Thread"
          onClick={() => setNewPostOpen(true)}
        />
        <SpeedDialAction
          icon={<CategoryIcon />}
          tooltipTitle="New Category"
          onClick={() => setNewCategoryOpen(true)}
        />
      </SpeedDial>

      {/* Dialogs */}
      <NewPostDialog open={newPostOpen} onClose={() => setNewPostOpen(false)} />
      <NewCategoryDialog
        open={newCategoryOpen}
        onClose={() => setNewCategoryOpen(false)}
      />
    </>
  );
};

export default CategoryDetailPage;
