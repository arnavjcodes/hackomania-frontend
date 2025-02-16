// src/pages/MeetupPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Event as EventIcon } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

interface Meetup {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  location: string;
  event_type: string; // "physical", "online", or "hybrid"
  user?: {
    id: number;
    username: string;
    name: string | null;
  };
  attendees?: Array<{
    id: number;
    username: string;
    name: string | null;
  }>;
  url?: string;
}

const MeetupPage: React.FC = () => {
  const [userMeetups, setUserMeetups] = useState<Meetup[]>([]);
  const [externalEvents, setExternalEvents] = useState<Meetup[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"user" | "external">("user");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const navigate = useNavigate();

  // New meetup form state (for user-organized meetups)
  const [newMeetup, setNewMeetup] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    location: "",
    event_type: "physical",
  });
  const [creating, setCreating] = useState(false);

  // Fetch community gatherings on mount
  useEffect(() => {
    const fetchMeetups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/meetups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserMeetups(res.data);
      } catch (err) {
        console.error("Error fetching gatherings:", err);
        setError("Failed to load gatherings.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchMeetups();
  }, []);

  // Fetch geek expeditions when external tab is active or search term changes
  useEffect(() => {
    if (activeTab === "external") {
      const debounceTimer = setTimeout(() => {
        const fetchExternalEvents = async () => {
          setLoadingExternal(true);
          try {
            const token = localStorage.getItem("token");
            const res = await axios.get("/api/v1/external_events", {
              headers: { Authorization: `Bearer ${token}` },
              params: { search: searchTerm, location: "Singapore" },
            });
            setExternalEvents(res.data.events);
          } catch (err) {
            console.error("Error fetching geek expeditions:", err);
            setError("Failed to load geek expeditions.");
          } finally {
            setLoadingExternal(false);
          }
        };
        fetchExternalEvents();
      }, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [activeTab, searchTerm]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    setNewMeetup({ ...newMeetup, [e.target.name]: e.target.value });
  };

  const handleCreateMeetup = async () => {
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/v1/meetups",
        { event: newMeetup },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserMeetups((prev) => [res.data.meetup, ...prev]);
      setNewMeetup({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        event_type: "physical",
      });
    } catch (err) {
      console.error("Error creating gathering:", err);
      setError("Failed to create gathering.");
    } finally {
      setCreating(false);
    }
  };

  const filteredUserMeetups = userMeetups.filter((meetup) => {
    if (filterType === "all") return true;
    return meetup.event_type === filterType;
  });

  const filteredExternalEvents = externalEvents.filter((event) => {
    if (filterType === "all") return true;
    return event.event_type === filterType;
  });

  const renderMeetupCards = (meetupsList: Meetup[]) => {
    if (meetupsList.length === 0) {
      return (
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          No events found. Invite your friends to create one!
        </Typography>
      );
    }
    return meetupsList.map((meetup) => (
      <Card
        key={meetup.id}
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          borderLeft: "6px solid",
          borderColor: "primary.main",
          bgcolor: "background.paper",
          cursor: "pointer",
          "&:hover": { transform: "translateY(-2px)" },
        }}
        onClick={() => navigate(`/meetups/${meetup.id}`)}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <EventIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontFamily: '"Press Start 2P", monospace',
              }}
            >
              {meetup.title}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 1, fontFamily: "monospace" }}>
            {meetup.description}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {new Date(meetup.start_time).toLocaleString()} -{" "}
            {meetup.end_time
              ? new Date(meetup.end_time).toLocaleString()
              : "N/A"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.secondary" }}
          >
            {meetup.event_type === "online"
              ? "Online Gathering"
              : meetup.event_type === "hybrid"
              ? "Hybrid Gathering"
              : "In-Person Gathering"}{" "}
            | {meetup.location}
          </Typography>
          {meetup.url && (
            <Typography
              variant="caption"
              sx={{ display: "block", color: "primary.main" }}
            >
              <a
                href={meetup.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Visit Organising Website
              </a>
            </Typography>
          )}
        </CardContent>
      </Card>
    ));
  };

  if (activeTab === "user" && loadingUser) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (activeTab === "external" && loadingExternal) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress color="primary" />
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
          bgcolor: "background.default",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Navbar isLoggedIn onLogout={() => navigate("/login")} />
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          ./gatherings
        </Typography>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="Community Gatherings" value="user" />
          <Tab label="Geek Expeditions" value="external" />
        </Tabs>
        {activeTab === "external" && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search Geek Expeditions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button onClick={() => setSearchTerm(searchTerm.trim())}>
                      Search
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel
                  id="filter-type-label"
                  sx={{ color: "text.primary" }}
                >
                  Filter by Gathering Type
                </InputLabel>
                <Select
                  labelId="filter-type-label"
                  label="Filter by Gathering Type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  sx={{
                    ".MuiOutlinedInput-notchedOutline": {
                      borderColor: "divider",
                    },
                    color: "text.primary",
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="physical">Physical</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                  <MenuItem value="hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {activeTab === "user"
              ? renderMeetupCards(filteredUserMeetups)
              : renderMeetupCards(filteredExternalEvents)}
          </Grid>
          {activeTab === "user" && (
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 3,
                  border: "2px dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    fontFamily: '"Press Start 2P", monospace',
                    color: "primary.main",
                  }}
                >
                  Organize Your Gathering
                </Typography>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={newMeetup.title}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={newMeetup.description}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Start Time"
                  name="start_time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={newMeetup.start_time}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="End Time"
                  name="end_time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={newMeetup.end_time}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Location / URL"
                  name="location"
                  value={newMeetup.location}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  variant="outlined"
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel
                    id="event-type-label"
                    sx={{ color: "text.primary" }}
                  >
                    Gathering Type
                  </InputLabel>
                  <Select
                    labelId="event-type-label"
                    label="Gathering Type"
                    name="event_type"
                    value={newMeetup.event_type}
                    onChange={handleInputChange}
                    sx={{
                      ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "divider",
                      },
                      color: "text.primary",
                    }}
                  >
                    <MenuItem value="physical">Physical</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                    <MenuItem value="hybrid">Hybrid</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleCreateMeetup}
                  disabled={creating}
                  sx={{ borderRadius: 2, py: 1 }}
                >
                  {creating ? "Creating..." : "Create Gathering"}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default MeetupPage;
