import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Grid,
  Avatar,
  Chip,
  useTheme,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import {
  Edit as EditIcon,
  Comment as CommentIcon,
  DateRange,
  Favorite,
  Spa,
  People,
  PersonAdd,
  PersonRemove,
} from "@mui/icons-material";
import Navbar from "../components/layout/Navbar";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  bio: string;
  created_at: string;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
  forum_threads: Array<{
    id: number;
    title: string;
    content: string;
    created_at: string;
    likes_count: number;
    chill_votes_count: number;
  }>;
  comments: Array<{
    id: number;
    content: string;
    created_at: string;
    thread_id: number;
    thread_title: string;
  }>;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<
    "posts" | "comments" | "followers" | "following"
  >("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const url = userId ? `/api/v1/users/${userId}` : "/api/v1/user";
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const fetchRelationships = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem("token");
        if (activeTab === "followers") {
          const res = await axios.get(`/api/v1/users/${user.id}/followers`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFollowers(res.data);
        } else if (activeTab === "following") {
          const res = await axios.get(`/api/v1/users/${user.id}/following`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFollowing(res.data);
        }
      } catch (err) {
        console.error("Error fetching relationships:", err);
      }
    };

    fetchRelationships();
  }, [activeTab, user]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleFollow = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/v1/users/${user.id}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser((prev) =>
        prev
          ? {
              ...prev,
              is_following: true,
              followers_count: prev.followers_count + 1,
            }
          : null
      );
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/v1/users/${user.id}/unfollow`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((prev) =>
        prev
          ? {
              ...prev,
              is_following: false,
              followers_count: prev.followers_count - 1,
            }
          : null
      );
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  const renderFollowButton = () => {
    if (
      !user ||
      !userId ||
      user.id.toString() === localStorage.getItem("currentUserId")
    )
      return null;

    return user.is_following ? (
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<PersonRemove />}
        onClick={handleUnfollow}
        sx={{ borderRadius: 20, px: 3 }}
      >
        Following
      </Button>
    ) : (
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAdd />}
        onClick={handleFollow}
        sx={{ borderRadius: 20, px: 3 }}
      >
        Follow
      </Button>
    );
  };

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

      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          position: "relative",
        }}
      >
        {/* Cover Photo */}
        <Box
          sx={{
            height: 200,
            background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            position: "relative",
            borderRadius: "0 0 16px 16px",
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              border: "4px solid white",
              position: "absolute",
              bottom: -60,
              left: "50%",
              transform: "translateX(-50%)",
              bgcolor: theme.palette.primary.main,
            }}
          >
            {user?.name?.[0] || user?.username?.[0]}
          </Avatar>
        </Box>

        {/* Profile Content */}
        <Box sx={{ pt: 8, px: 4, pb: 4 }}>
          {/* Profile Header */}
          <Box sx={{ textAlign: "center", mb: 4, position: "relative" }}>
            <Box sx={{ marginBottom: 2, marginTop: 2 }}>
              {renderFollowButton()}
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                color: theme.palette.text.primary,
              }}
            >
              {user?.name || user?.username}
            </Typography>

            <Chip
              label={`@${user?.username}`}
              variant="outlined"
              sx={{
                borderRadius: 4,
                borderColor: theme.palette.divider,
                bgcolor: theme.palette.background.paper,
              }}
            />

            <Grid
              container
              spacing={2}
              sx={{ mt: 2, justifyContent: "center" }}
            >
              <Grid item>
                <Chip
                  icon={<People fontSize="small" />}
                  label={`${user?.followers_count} Followers`}
                  variant="outlined"
                  clickable
                  onClick={() => setActiveTab("followers")}
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<People fontSize="small" />}
                  label={`${user?.following_count} Following`}
                  variant="outlined"
                  clickable
                  onClick={() => setActiveTab("following")}
                />
              </Grid>

              <Grid item>
                <Chip
                  icon={<EditIcon fontSize="small" />}
                  label={`${user?.forum_threads?.length || 0} Threads`}
                  variant="outlined"
                />
              </Grid>
              <Grid item>
                <Chip
                  icon={<CommentIcon fontSize="small" />}
                  label={`${user?.comments?.length || 0} Comments`}
                  variant="outlined"
                />
              </Grid>
            </Grid>

            {user?.bio && (
              <Typography
                variant="body1"
                sx={{
                  mt: 3,
                  maxWidth: 600,
                  mx: "auto",
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                }}
              >
                {user.bio}
              </Typography>
            )}
          </Box>

          {/* Content Tabs */}
          <Paper
            sx={{
              mb: 3,
              borderRadius: 3,
              bgcolor: "background.paper",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                label="Threads"
                value="posts"
                icon={<EditIcon />}
                iconPosition="start"
                sx={{ py: 2, fontSize: 16 }}
              />
              <Tab
                label="Comments"
                value="comments"
                icon={<CommentIcon />}
                iconPosition="start"
                sx={{ py: 2, fontSize: 16 }}
              />
              <Tab
                label="Followers"
                value="followers"
                icon={<People />}
                iconPosition="start"
                sx={{ py: 2, fontSize: 16 }}
              />
              <Tab
                label="Following"
                value="following"
                icon={<People />}
                iconPosition="start"
                sx={{ py: 2, fontSize: 16 }}
              />
            </Tabs>
          </Paper>

          {/* Content Sections */}
          {activeTab === "followers" && (
            <List sx={{ width: "100%" }}>
              {followers.map((follower) => (
                <ListItem
                  onClick={() => navigate(`/users/${follower.id}`)}
                  key={follower.id}
                  sx={{ py: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {follower.name?.[0] || follower.username[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={follower.name || follower.username}
                    secondary={`@${follower.username}`}
                  />
                </ListItem>
              ))}
              {followers.length === 0 && (
                <Box
                  sx={{ textAlign: "center", py: 8, color: "text.secondary" }}
                >
                  <People sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6">No followers yet</Typography>
                </Box>
              )}
            </List>
          )}

          {activeTab === "following" && (
            <List sx={{ width: "100%" }}>
              {following.map((user) => (
                <ListItem
                  onClick={() => navigate(`/users/${user.id}`)}
                  key={user.id}
                  sx={{ py: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {user.name?.[0] || user.username[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name || user.username}
                    secondary={`@${user.username}`}
                  />
                </ListItem>
              ))}
              {following.length === 0 && (
                <Box
                  sx={{ textAlign: "center", py: 8, color: "text.secondary" }}
                >
                  <People sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h6">Not following anyone yet</Typography>
                </Box>
              )}
            </List>
          )}

          <Box
            sx={{
              display: "grid",
              gap: 3,
              gridTemplateColumns: { md: "repeat(2, 1fr)" },
            }}
          >
            {activeTab === "posts" &&
              user?.forum_threads?.map((thread) => (
                <Card
                  key={thread.id}
                  onClick={() => navigate(`/forum_threads/${thread.id}`)}
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[6],
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      {thread.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {thread.content}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        color: "text.secondary",
                      }}
                    >
                      <Chip
                        label={new Date(thread.created_at).toLocaleDateString()}
                        size="small"
                        icon={<DateRange fontSize="small" />}
                      />
                      <Box sx={{ flexGrow: 1 }} />
                      <Favorite fontSize="small" />
                      <Typography variant="body2">
                        {thread.likes_count}
                      </Typography>
                      <Spa fontSize="small" />
                      <Typography variant="body2">
                        {thread.chill_votes_count}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}

            {activeTab === "comments" &&
              user?.comments?.map((comment) => (
                <Card
                  key={comment.id}
                  onClick={() =>
                    navigate(`/forum_threads/${comment.thread_id}`)
                  }
                  sx={{
                    cursor: "pointer",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: theme.shadows[6],
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "text.secondary",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CommentIcon color="action" fontSize="small" />
                      In: {comment.thread_title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {comment.content}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        color: "text.secondary",
                      }}
                    >
                      <Chip
                        label={new Date(
                          comment.created_at
                        ).toLocaleDateString()}
                        size="small"
                        icon={<DateRange fontSize="small" />}
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}

            {/* Empty States */}
            {activeTab === "posts" && user?.forum_threads?.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "text.secondary",
                }}
              >
                <EditIcon sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6">No posts created yet</Typography>
              </Box>
            )}

            {activeTab === "comments" && user?.comments?.length === 0 && (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "text.secondary",
                }}
              >
                <CommentIcon sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6">No comments yet</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ProfilePage;
