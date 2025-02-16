// src/pages/MeetupDetailPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Star,
  Visibility,
  People as PeopleIcon,
} from "@mui/icons-material";
import axios from "axios";
import Navbar from "../components/layout/Navbar";

interface Meetup {
  id: number;
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  location: string;
  event_type: string; // "physical", "online", or "hybrid"
  user: {
    id: number;
    username: string;
    name: string | null;
  };
  attendees: Array<{
    id: number;
    username: string;
    name: string | null;
  }>;
}

const MeetupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [meetup, setMeetup] = useState<Meetup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Assume current user's id is stored in localStorage under "userId"
  const currentUserId = Number(localStorage.getItem("userId"));

  useEffect(() => {
    const fetchMeetup = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/v1/meetups/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeetup(res.data);
      } catch (err) {
        console.error("Error fetching gathering:", err);
        setError("Failed to load gathering details.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetup();
  }, [id]);

  const handleAttend = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/v1/meetups/${id}/attend`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh the gathering details after joining
      const res = await axios.get(`/api/v1/meetups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeetup(res.data);
    } catch (err) {
      console.error("Error joining gathering:", err);
    }
  };

  const handleLeave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/v1/meetups/${id}/attend`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh the gathering details after leaving
      const res = await axios.get(`/api/v1/meetups/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeetup(res.data);
    } catch (err) {
      console.error("Error leaving gathering:", err);
    }
  };

  if (loading) {
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

  if (error || !meetup) {
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
        <Typography variant="h6" color="error">
          {error || "Gathering not found."}
        </Typography>
      </Box>
    );
  }

  // Determine if the current user is already an attendee
  const isAttending = meetup.attendees.some(
    (attendee) => attendee.id === currentUserId
  );

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
        p: 4,
      }}
    >
      <Navbar isLoggedIn onLogout={() => navigate("/login")} />
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, borderRadius: 2 }}
      >
        Back
      </Button>
      <Card
        sx={{
          mb: 4,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Press Start 2P", monospace', mb: 2 }}
          >
            {meetup.title}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2, fontFamily: "monospace" }}>
            {meetup.description}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mb: 1 }}
          >
            {new Date(meetup.start_time).toLocaleString()} -{" "}
            {meetup.end_time
              ? new Date(meetup.end_time).toLocaleString()
              : "N/A"}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", mb: 2 }}
          >
            {meetup.event_type === "online"
              ? "Online Gathering"
              : meetup.event_type === "hybrid"
              ? "Hybrid Gathering"
              : "In-Person Gathering"}{" "}
            | {meetup.location}
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, fontFamily: "monospace" }}
          >
            Hosted by {meetup.user.name || meetup.user.username}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <PeopleIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="body2">
              {meetup.attendees.length}{" "}
              {meetup.attendees.length === 1 ? "attendee" : "attendees"}
            </Typography>
          </Box>
          {isAttending ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLeave}
              sx={{ borderRadius: 2 }}
            >
              Leave Gathering
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAttend}
              sx={{ borderRadius: 2 }}
            >
              Join Gathering
            </Button>
          )}
        </CardContent>
      </Card>
      <Box>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontFamily: '"Press Start 2P", monospace' }}
        >
          Attendees
        </Typography>
        {meetup.attendees.length > 0 ? (
          meetup.attendees.map((attendee) => (
            <Card
              key={attendee.id}
              sx={{ mb: 1, bgcolor: "background.paper", p: 1 }}
            >
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {attendee.name || attendee.username}
              </Typography>
            </Card>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            No attendees yet. Be the first to join!
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MeetupDetailPage;
