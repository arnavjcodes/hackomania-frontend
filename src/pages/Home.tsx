import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import NewPostDialog from "../components/NewPostDialog";
import NewCategoryDialog from "../components/NewCategoryDialog";
import NewProjectDialog from "../components/NewProjectDialog";

import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Button,
} from "@mui/material";
import { SpeedDial, SpeedDialAction } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import ForumIcon from "@mui/icons-material/Forum";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SpaIcon from "@mui/icons-material/Spa";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ExploreIcon from "@mui/icons-material/Explore";

interface FeedThread {
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
  updated_at: string;

  // New toggling fields
  user_liked: boolean;
  user_chilled: boolean;
}

// Optional color mapping for moods
const moodColors: Record<string, string> = {
  chill: "#88c0d0",
  excited: "#bf616a",
  curious: "#ebcb8b",
  supportive: "#a3be8c",
  casual: "#d08770",
};

interface HomeProps {
  logout: () => void;
}
const HomePage: React.FC<HomeProps> = ({ logout }) => {
  const [feedThreads, setFeedThreads] = useState<FeedThread[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch feed on mount (GET /api/v1/feed)
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<FeedThread[]>("/api/v1/feed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedThreads(res.data);
      } catch (err) {
        console.error("Error fetching feed:", err);
        setError("Failed to load feed.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // Toggle Like
  const handleLike = async (threadId: number) => {
    try {
      const token = localStorage.getItem("token");
      // We assume your backend route is /toggle_like
      // If you're still using /like, adapt accordingly
      const res = await axios.patch<FeedThread>(
        `/api/v1/forum_threads/${threadId}/toggle_like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local feed
      const updated = res.data;
      setFeedThreads((prev) =>
        prev.map((t) => (t.id === threadId ? updated : t))
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Toggle Chill
  const handleChill = async (threadId: number) => {
    try {
      const token = localStorage.getItem("token");
      // We assume your backend route is /toggle_chill
      const res = await axios.patch<FeedThread>(
        `/api/v1/forum_threads/${threadId}/toggle_chill`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local feed
      const updated = res.data;
      setFeedThreads((prev) =>
        prev.map((t) => (t.id === threadId ? updated : t))
      );
    } catch (err) {
      console.error("Error toggling chill:", err);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
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
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Fixed Navbar at top */}
      <Navbar
        isLoggedIn
        onLogout={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      />

      {/* Layout container with Sidebar + Main content */}
      <Box sx={{ display: "flex" }}>
        {/* LEFT SIDEBAR (fixed/sticky) */}

        {/* MAIN CONTENT: scrollable feed area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            maxHeight: "calc(100vh - 64px)",
            p: { xs: 2, sm: 3 },
            mt: "64px", // to ensure we don't hide behind navbar
            width: "100%",
          }}
        >
          <Typography variant="h4" sx={{ mb: 3 }}>
            Your Personalized Feed
          </Typography>

          {feedThreads.map((thread) => {
            const moodColor = moodColors[thread.mood] || "#ccc";
            return (
              <Card
                key={thread.id}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                  borderLeft: `6px solid ${moodColor}`,
                }}
                onClick={() => navigate(`/forum_threads/${thread.id}`)}
              >
                <CardContent>
                  {/* Author & Title */}
                  <Typography variant="subtitle2" sx={{ color: "#666", mb: 1 }}>
                    Posted by:{" "}
                    {thread.user?.name || thread.user?.username || "Unknown"}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                    {thread.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {thread.content}
                  </Typography>

                  {/* Reaction Row */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    {/* Like */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(thread.id);
                        }}
                        sx={{
                          color: thread.user_liked ? "red" : "inherit",
                        }}
                      >
                        {thread.user_liked ? (
                          <FavoriteIcon />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                      <Typography variant="body2">
                        {thread.likes_count}
                      </Typography>
                    </Box>

                    {/* Chill */}
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
                          "&:hover": { backgroundColor: "#dceff3" },
                        }}
                      >
                        <SpaIcon />
                      </IconButton>
                      <Typography variant="body2">
                        {thread.chill_votes_count}
                      </Typography>
                    </Box>

                    {/* Comments */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <ChatBubbleOutlineIcon sx={{ color: "#666" }} />
                      <Typography variant="body2">
                        {thread.comments_count}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* SpeedDial at bottom-right */}
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
        <SpeedDialAction
          icon={<CategoryIcon />}
          tooltipTitle="New Project"
          onClick={() => setNewProjectOpen(true)}
        />
      </SpeedDial>

      {/* Dialogs */}
      <NewPostDialog open={newPostOpen} onClose={() => setNewPostOpen(false)} />
      <NewCategoryDialog
        open={newCategoryOpen}
        onClose={() => setNewCategoryOpen(false)}
      />
      <NewProjectDialog
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />
    </>
  );
};

export default HomePage;
