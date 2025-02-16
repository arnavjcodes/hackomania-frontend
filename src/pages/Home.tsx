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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemText,
  ListItemButton,
  SpeedDial,
  SpeedDialAction,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import ForumIcon from "@mui/icons-material/Forum";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import SpaIcon from "@mui/icons-material/Spa";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SearchIcon from "@mui/icons-material/Search";

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
  user_liked: boolean;
  user_chilled: boolean;
}

interface Event {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  user: {
    id: number;
    username: string;
    name: string | null;
  };
  created_at: string;
  updated_at: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  repo_link?: string;
  live_site_link?: string;
  tech_stack?: string;
  user: {
    id: number;
    username: string;
    name: string | null;
  };
  created_at: string;
  updated_at: string;
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
  const navigate = useNavigate();

  // Tab state: 0 = Forum, 1 = Gatherings, 2 = The Forge
  const [selectedTab, setSelectedTab] = useState<number>(0);

  // Data states
  const [forumThreads, setForumThreads] = useState<FeedThread[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  // Loading and error states for each section
  const [loadingForum, setLoadingForum] = useState<boolean>(true);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Dialog states for creation modals
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newProjectOpen, setNewProjectOpen] = useState(false);

  // Search Dialog state
  const [searchOpen, setSearchOpen] = useState(false);

  // Updated search options with rebranded copy and routes
  const searchOptions = [
    {
      label: "Hack the Code: Forge New Collaborations",
      route: "/projects",
    },
    {
      label: "Join the Convo: Dive into Epic Discussions",
      route: "/categories",
    },
    {
      label: "Quest for Knowledge: Explore Geek Expeditions",
      route: "/meetups",
    },
  ];

  // Fetch Forum Threads (for the Forum tab)
  useEffect(() => {
    const fetchForumThreads = async () => {
      setLoadingForum(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<FeedThread[]>("/api/v1/feed", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForumThreads(res.data);
      } catch (err) {
        console.error("Error fetching forum threads:", err);
        setError("Failed to load forum threads.");
      } finally {
        setLoadingForum(false);
      }
    };

    if (selectedTab === 0) {
      fetchForumThreads();
    }
  }, [selectedTab]);

  // Fetch Events (Gatherings) when the Gatherings tab is selected
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Event[]>("/api/v1/meetups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load gatherings.");
      } finally {
        setLoadingEvents(false);
      }
    };

    if (selectedTab === 1 && events.length === 0) {
      fetchEvents();
    }
  }, [selectedTab, events.length]);

  // Fetch Projects (The Forge) when the The Forge tab is selected
  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<Project[]>("/api/v1/projects", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(res.data);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load The Forge.");
      } finally {
        setLoadingProjects(false);
      }
    };

    if (selectedTab === 2 && projects.length === 0) {
      fetchProjects();
    }
  }, [selectedTab, projects.length]);

  // Toggle Like for a Forum Thread
  const handleLike = async (threadId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch<FeedThread>(
        `/api/v1/forum_threads/${threadId}/toggle_like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      setForumThreads((prev) =>
        prev.map((t) => (t.id === threadId ? updated : t))
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Toggle Chill for a Forum Thread
  const handleChill = async (threadId: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch<FeedThread>(
        `/api/v1/forum_threads/${threadId}/toggle_chill`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = res.data;
      setForumThreads((prev) =>
        prev.map((t) => (t.id === threadId ? updated : t))
      );
    } catch (err) {
      console.error("Error toggling chill:", err);
    }
  };

  // Render a loading spinner for the active tab
  const renderLoading = () => (
    <Box
      sx={{
        display: "flex",
        height: "50vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress />
    </Box>
  );

  // Render content based on the selected tab
  const renderContent = () => {
    if (selectedTab === 0) {
      // Forum Threads
      if (loadingForum) return renderLoading();
      return forumThreads.map((thread) => {
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
            }}
            onClick={() => navigate(`/forum_threads/${thread.id}`)}
          >
            <CardContent>
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                  <Typography variant="body2">{thread.likes_count}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ChatBubbleOutlineIcon sx={{ color: "#666" }} />
                  <Typography variant="body2">
                    {thread.comments_count}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      });
    } else if (selectedTab === 1) {
      // Gatherings
      if (loadingEvents) return renderLoading();
      return events.map((event) => (
        <Card
          key={event.id}
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/meetups/${event.id}`)}
        >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              {event.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {event.description}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "#666" }}>
              {new Date(event.start_time).toLocaleString()} –{" "}
              {new Date(event.end_time).toLocaleString()} | {event.location}
            </Typography>
          </CardContent>
        </Card>
      ));
    } else if (selectedTab === 2) {
      // The Forge
      if (loadingProjects) return renderLoading();
      return projects.map((project) => (
        <Card
          key={project.id}
          sx={{
            mb: 3,
            borderRadius: 2,
            boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          <CardContent>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
              {project.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.description}
            </Typography>
            {project.tech_stack && (
              <Typography variant="subtitle2" sx={{ color: "#666" }}>
                Tech Stack: {project.tech_stack}
              </Typography>
            )}
          </CardContent>
        </Card>
      ));
    }
  };

  return (
    <>
      <Navbar
        isLoggedIn
        onLogout={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }}
      />

      {/* Left-aligned header displaying 127.0.0.1 */}

      <Box sx={{ p: { xs: 2, sm: 3 }, mt: "64px" }}>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          127.0.0.1
        </Typography>
        {/* Search Button */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<SearchIcon />}
            onClick={() => setSearchOpen(true)}
          >
            Search & Discover
          </Button>
        </Box>

        {/* Tabs for Forum, Gatherings, The Forge */}
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="Archives" />
          <Tab label="Gatherings" />
          <Tab label="The Forge" />
        </Tabs>

        {/* Content Area */}
        {error ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          renderContent()
        )}
      </Box>

      {/* Floating Action Button SpeedDial */}
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
          tooltipTitle="New Forge"
          onClick={() => setNewProjectOpen(true)}
        />
      </SpeedDial>

      {/* Dialogs for creating new items */}
      <NewPostDialog open={newPostOpen} onClose={() => setNewPostOpen(false)} />
      <NewCategoryDialog
        open={newCategoryOpen}
        onClose={() => setNewCategoryOpen(false)}
      />
      <NewProjectDialog
        open={newProjectOpen}
        onClose={() => setNewProjectOpen(false)}
      />

      {/* Search Dialog */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} fullWidth>
        <DialogTitle>Search & Discover</DialogTitle>
        <DialogContent>
          <TextField
            label="Search"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <List>
            {searchOptions.map((option) => (
              <ListItemButton
                key={option.route}
                onClick={() => {
                  navigate(option.route);
                  setSearchOpen(false);
                }}
              >
                <ListItemText primary={option.label} />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HomePage;
