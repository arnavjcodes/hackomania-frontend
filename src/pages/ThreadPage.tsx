// src/pages/ThreadPage.tsx

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/layout/Navbar";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  TextField,
  Button,
  styled,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Spa as SpaIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import moment from "moment";

// Define Interfaces
interface User {
  id: number;
  username: string;
  name: string | null;
}

interface Comment {
  id: number;
  content: string;
  user: User;
  mood: string;
  created_at: string;
  replies: Comment[];
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Thread {
  id: number;
  title: string;
  content: string;
  created_at: string;
  mood: "chill" | "excited" | "curious" | "supportive";
  likes_count: number;
  chill_votes_count: number;
  comments_count: number;
  user: User;
  user_liked: boolean;
  user_chilled: boolean;
  category: Category;
  tags: Array<{
    name: string;
    id: number;
  }>;
}

// Styled Components
const CommentContainer = styled(Box)(
  ({ theme, depth }: { theme?: any; depth: number }) => ({
    display: "flex",
    marginTop: theme.spacing(1),
    marginLeft: depth > 0 ? theme.spacing(depth * 2) : 0,
    position: "relative",
    "&:before": {
      content: '""',
      position: "absolute",
      left: -16,
      top: 0,
      bottom: 0,
      width: "2px",
      backgroundColor: depth > 0 ? theme.palette.divider : "transparent",
    },
  })
);

const CommentContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  borderRadius: 4,
  padding: theme.spacing(1.5),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  transition: "all 0.2s ease",
}));

// Define Props for CommentComponent
interface CommentComponentProps {
  comment: Comment;
  depth?: number;
  collapsedComments: Set<number>;
  toggleCollapse: (commentId: number) => void;
  replyingTo: number | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<number | null>>;
  handleAddComment: (content: string, parentId: number | null) => Promise<void>;
}

// CommentComponent Definition
const CommentComponent: React.FC<CommentComponentProps> = ({
  comment,
  depth = 0,
  collapsedComments,
  toggleCollapse,
  replyingTo,
  setReplyingTo,
  handleAddComment,
}) => {
  const [replyContent, setReplyContent] = useState("");
  const isCollapsed = collapsedComments.has(comment.id);
  const isReplying = replyingTo === comment.id;

  const handleLocalReply = useCallback(() => {
    handleAddComment(replyContent, comment.id);
    setReplyContent("");
    setReplyingTo(null);
  }, [replyContent, comment.id, handleAddComment, setReplyingTo]);

  return (
    <CommentContainer depth={depth}>
      <CommentContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              fontSize: "0.75rem",
              bgcolor: "primary.main",
            }}
          >
            {comment.user.name?.charAt(0) || comment.user.username.charAt(0)}
          </Avatar>
          <Typography variant="subtitle2" fontWeight="bold">
            {comment.user.name || comment.user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {moment(comment.created_at).fromNow()}
          </Typography>
          {comment.replies.length > 0 && (
            <Button
              size="small"
              onClick={() => toggleCollapse(comment.id)}
              sx={{
                ml: 1,
                color: "text.secondary",
                fontSize: "0.75rem",
                minWidth: 0,
                "&:hover": { backgroundColor: "transparent" },
              }}
              endIcon={
                isCollapsed ? (
                  <ExpandMoreIcon fontSize="small" />
                ) : (
                  <ExpandLessIcon fontSize="small" />
                )
              }
            >
              {isCollapsed ? `Show ${comment.replies.length} replies` : "Hide"}
            </Button>
          )}
        </Box>

        <Typography variant="body1" mb={1}>
          {comment.content}
        </Typography>

        <IconButton
          size="small"
          onClick={() =>
            setReplyingTo((prev) => (prev === comment.id ? null : comment.id))
          }
          sx={{ color: "text.secondary" }}
        >
          <ReplyIcon fontSize="small" />
          <Typography variant="caption" ml={0.5}>
            Reply
          </Typography>
        </IconButton>

        {isReplying && (
          <Box sx={{ mt: 2, ml: 2 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              variant="outlined"
              placeholder="Write your reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              sx={{ mb: 1 }}
              autoFocus
            />
            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                onClick={() => setReplyingTo(null)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleLocalReply}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
            </Box>
          </Box>
        )}

        {!isCollapsed &&
          comment.replies.map((reply) => (
            <CommentComponent
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              collapsedComments={collapsedComments}
              toggleCollapse={toggleCollapse}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              handleAddComment={handleAddComment}
            />
          ))}
      </CommentContent>
    </CommentContainer>
  );
};

// Main ThreadPage Component
const ThreadPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [thread, setThread] = useState<Thread | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainComment, setMainComment] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [collapsedComments, setCollapsedComments] = useState<Set<number>>(
    new Set()
  );

  const toggleCollapse = useCallback((commentId: number) => {
    setCollapsedComments((prev) => {
      const newCollapsed = new Set(prev);
      newCollapsed.has(commentId)
        ? newCollapsed.delete(commentId)
        : newCollapsed.add(commentId);
      return newCollapsed;
    });
  }, []);

  useEffect(() => {
    const fetchThread = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/v1/forum_threads/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setThread(res.data.forum_thread);
        setComments(res.data.comments);
      } catch (err) {
        console.error("Error fetching thread:", err);
        setError("Failed to load thread.");
      } finally {
        setLoading(false);
      }
    };
    fetchThread();
  }, [id]);

  const handleLike = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `/api/v1/forum_threads/${id}/toggle_like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setThread(res.data);
    } catch (err) {
      console.error("Error liking thread:", err);
    }
  }, [id]);

  const handleChill = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.patch(
        `/api/v1/forum_threads/${id}/toggle_chill`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setThread(res.data);
    } catch (err) {
      console.error("Error chill-voting thread:", err);
    }
  }, [id]);

  const handleAddComment = useCallback(
    async (content: string, parentId: number | null) => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `/api/v1/forum_threads/${id}/comments`,
          { content, parent_id: parentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        window.location.reload();

        setMainComment("");
        setReplyingTo(null);
      } catch (err) {
        console.error("Error adding comment:", err);
      }
    },
    [id]
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
      <Box sx={{ maxWidth: "800px", mx: "auto", p: 3 }}>
        {/* Category and Mood Header */}
        <Box display="flex" gap={1} sx={{ mb: 3 }}>
          <Chip
            label={thread?.category?.name || "General"}
            size="small"
            sx={{
              bgcolor: "primary.light",
              color: "primary.contrastText",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.7rem",
              letterSpacing: "0.5px",
            }}
          />
          <Chip
            label={thread?.mood}
            size="small"
            sx={{
              bgcolor: {
                chill: "#88c0d0",
                excited: "#bf616a",
                curious: "#ebcb8b",
                supportive: "#a3be8c",
              }[thread?.mood || "chill"],
              color: "white",
              fontWeight: 700,
              fontSize: "0.7rem",
              letterSpacing: "0.5px",
            }}
          />
        </Box>

        <Typography
          variant="h3"
          sx={{
            mb: 3,
            fontWeight: 800,
            lineHeight: 1.2,
            color: "text.primary",
            position: "relative",
            "&:after": {
              content: '""',
              display: "block",
              width: "60px",
              height: "4px",
              backgroundColor: "primary.main",
              mt: 2,
              borderRadius: "2px",
            },
          }}
        >
          {thread?.title}
        </Typography>

        <Box
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: "background.paper",
            boxShadow: 1,
            mb: 4,
          }}
        >
          <Box
            onClick={() => navigate(`/users/${thread?.user?.id}`)}
            display="flex"
            alignItems="center"
            gap={2}
            mb={2}
          >
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 40,
                height: 40,
                fontSize: "1rem",
              }}
            >
              {thread?.user.name?.charAt(0) || thread?.user.username.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                {thread?.user.name || thread?.user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {moment(thread?.created_at).format("MMM D, YYYY")}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body1"
            sx={{
              mb: 3,
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "text.secondary",
            }}
          >
            {thread?.content}
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
            {thread?.tags.map((tag: { name: string; id: number }) => (
              <Chip
                key={tag.id}
                label={`#${tag.name}`}
                size="small"
                sx={{
                  bgcolor: "secondary.light",
                  color: "secondary.contrastText",
                  fontWeight: "bold",
                  fontSize: "0.75rem",
                }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" gap={2} alignItems="center">
            <IconButton
              onClick={handleLike}
              sx={{
                color: thread?.user_liked ? "error.main" : "text.secondary",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "error.main",
                  bgcolor: "rgba(255, 0, 0, 0.08)",
                },
              }}
            >
              {thread?.user_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              <Typography sx={{ ml: 0.5, fontWeight: 500 }}>
                {thread?.likes_count}
              </Typography>
            </IconButton>

            <IconButton
              onClick={handleChill}
              sx={{
                color: thread?.user_chilled ? "primary.main" : "text.secondary",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "rgba(0, 150, 255, 0.08)",
                },
              }}
            >
              <SpaIcon />
              <Typography sx={{ ml: 0.5, fontWeight: 500 }}>
                {thread?.chill_votes_count}
              </Typography>
            </IconButton>

            <Box display="flex" alignItems="center" color="text.secondary">
              <ChatBubbleOutlineIcon fontSize="small" />
              <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                {thread?.comments_count} comments
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <ChatBubbleOutlineIcon fontSize="inherit" />
          {thread?.comments_count} Comments
        </Typography>

        {comments.map((comment) => (
          <CommentComponent
            key={comment.id}
            comment={comment}
            collapsedComments={collapsedComments}
            toggleCollapse={toggleCollapse}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            handleAddComment={handleAddComment}
          />
        ))}

        <Box
          sx={{
            mt: 4,
            position: "sticky",
            bottom: 24,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 3,
            boxShadow: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            fullWidth
            multiline
            minRows={3}
            variant="outlined"
            placeholder="Share your thoughts..."
            value={mainComment}
            onChange={(e) => setMainComment(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                borderRadius: 2,
                fontSize: "1rem",
                "&:focus-within fieldset": {
                  borderColor: "primary.main !important",
                },
              },
            }}
          />
          <Box display="flex" justifyContent="flex-end">
            <StyledButton
              variant="contained"
              onClick={() => {
                handleAddComment(mainComment, null);
                setMainComment("");
              }}
              disabled={!mainComment.trim()}
              color="primary"
            >
              Post Comment
            </StyledButton>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ThreadPage;
