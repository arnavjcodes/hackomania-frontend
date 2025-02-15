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
  Button,
} from "@mui/material";
import {
  Search,
  Favorite,
  FavoriteBorder,
  Spa,
  ChatBubbleOutline,
  Event as EventIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Forum as ForumIcon,
} from "@mui/icons-material";
import Navbar from "../components/layout/Navbar";
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

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  location: string;
  event_type: string; // 'physical', 'online', or 'hybrid'
  user: {
    id: number;
    username: string;
    name: string | null;
  };
}

const moodColors: Record<string, string> = {
  chill: "#88c0d0",
  excited: "#bf616a",
  curious: "#ebcb8b",
  supportive: "#a3be8c",
  casual: "#d08770",
};

const ExplorePage: React.FC = () => {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);

  // Fetch forum threads
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/forum_threads", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setThreads(res.data);
      } catch (err) {
        console.error("Error fetching threads:", err);
        setError("Failed to load threads.");
      } finally {
        setLoadingThreads(false);
      }
    };

    fetchThreads();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/events", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        // Optionally, set a separate error state for events if needed
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, []);

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
      console.error("Error liking thread:", err);
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
      console.error("Error chill-voting thread:", err);
    }
  };

  const filteredThreads = threads.filter(
    (thread) =>
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadingThreads || loadingEvents) {
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
        <Typography
          variant="h4"
          sx={{ mb: 4, fontWeight: "bold", fontFamily: "monospace" }}
        >
          Explore & Connect
        </Typography>

        {/* Search Input */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search threads and events..."
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

        {/* Events Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              fontFamily: "monospace",
              color: "#5e81ac",
            }}
          >
            Upcoming Events
          </Typography>
          {events.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ textAlign: "center", color: "text.secondary" }}
            >
              No events found.
            </Typography>
          ) : (
            events.map((event) => (
              <Card
                key={event.id}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
                  borderLeft: `6px solid #5e81ac`,
                  backgroundColor: "#eceff4",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    transition: "transform 0.2s",
                  },
                }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <EventIcon sx={{ mr: 1, color: "#5e81ac" }} />
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", fontFamily: "monospace" }}
                    >
                      {event.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, fontFamily: "monospace" }}
                  >
                    {event.description}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {new Date(event.start_time).toLocaleString()} -{" "}
                    {event.end_time
                      ? new Date(event.end_time).toLocaleString()
                      : "N/A"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", color: "text.secondary" }}
                  >
                    {event.event_type === "online"
                      ? "Online Event"
                      : event.event_type === "hybrid"
                      ? "Hybrid Event"
                      : "In-Person Event"}{" "}
                    | {event.location}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Box>

        {/* Threads Section */}
        <Box>
          <Typography
            variant="h5"
            sx={{
              mb: 2,
              fontWeight: "bold",
              fontFamily: "monospace",
              color: "#5e81ac",
            }}
          >
            Forum Threads
          </Typography>
          {filteredThreads.length === 0 ? (
            <Typography
              variant="body1"
              sx={{ textAlign: "center", color: "text.secondary" }}
            >
              No threads found{searchQuery ? " matching your search" : ""}.
            </Typography>
          ) : (
            filteredThreads.map((thread) => {
              const moodColor = moodColors[thread.mood.toLowerCase()] || "#ccc";
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
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#666", mb: 1 }}
                    >
                      Posted by {thread.user?.name || thread.user?.username}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                      {thread.title}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {thread.content}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
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
                          {thread.user_liked ? (
                            <Favorite />
                          ) : (
                            <FavoriteBorder />
                          )}
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
                        <ChatBubbleOutline />
                        <Typography>{thread.comments_count}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>
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

export default ExplorePage;
