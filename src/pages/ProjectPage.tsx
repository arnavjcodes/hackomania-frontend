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
  Avatar,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  Reply as ReplyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Code as CodeIcon,
  Language as LanguageIcon,
  Terminal as TerminalIcon,
} from "@mui/icons-material";
import moment from "moment";

// -------------- INTERFACES --------------
interface User {
  id: number;
  username: string;
  name: string | null;
}

interface Comment {
  id: number;
  content: string;
  user: User;
  mood: string; // if used
  created_at: string;
  replies: Comment[];
}

interface Project {
  id: number;
  title: string;
  description?: string;
  repo_link?: string;
  live_site_link?: string;
  tech_stack?: string;
  schema_url?: string;
  flowchart_url?: string;
  created_at: string;
  user: User;
  collaborators?: User[];
  comments_count: number;
}

// -------------- STYLED COMPONENTS --------------

// A "terminal-like" container style for the forge header
const GeekHeader = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[4],
  color: theme.palette.primary.main,
  fontFamily: "'Ubuntu Mono', monospace",
  position: "relative",
  marginBottom: theme.spacing(3),
}));

const ProjectTitle = styled(Typography)(({ theme }: any) => ({
  fontSize: "2rem",
  lineHeight: 1.2,
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  position: "relative",
  "&:after": {
    content: '"_"',
    position: "absolute",
    bottom: 0,
    right: -15,
    fontWeight: 400,
    fontSize: "1.5rem",
    color: theme.palette.primary.main,
    animation: "blink 1s infinite",
  },
  "@keyframes blink": {
    "0%, 50%": { opacity: 1 },
    "50%, 100%": { opacity: 0 },
  },
}));

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
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

const StyledButton = styled(Button)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 500,
  borderRadius: "8px",
  padding: theme.spacing(1, 2),
  transition: "all 0.2s ease",
  fontFamily: "'Ubuntu Mono', monospace",
}));

const CodeLinkChip = styled(Chip)(({ theme }) => ({
  cursor: "pointer",
  fontFamily: "'Ubuntu Mono', monospace",
  fontSize: "0.8rem",
  padding: theme.spacing(0.5),
  borderRadius: "4px",
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

// -------------- COMMENT COMPONENT --------------
interface CommentComponentProps {
  comment: Comment;
  depth?: number;
  collapsedComments: Set<number>;
  toggleCollapse: (commentId: number) => void;
  replyingTo: number | null;
  setReplyingTo: React.Dispatch<React.SetStateAction<number | null>>;
  handleAddComment: (content: string, parentId: number | null) => Promise<void>;
}

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
              bgcolor: "secondary.main",
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
              placeholder="Add to the discussion..."
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

// -------------- MAIN FORGE PAGE COMPONENT --------------
const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // For current user details, assume they're stored in localStorage.
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mainComment, setMainComment] = useState<string>("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [collapsedComments, setCollapsedComments] = useState<Set<number>>(
    new Set()
  );
  const [joinLoading, setJoinLoading] = useState(false);

  const toggleCollapse = useCallback((commentId: number) => {
    setCollapsedComments((prev) => {
      const newCollapsed = new Set(prev);
      newCollapsed.has(commentId)
        ? newCollapsed.delete(commentId)
        : newCollapsed.add(commentId);
      return newCollapsed;
    });
  }, []);

  // Fetch Forge and Comments
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/v1/projects/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Expected response: { project: { ... }, comments: [ ... ] }
        setProject(res.data.project);
        setComments(res.data.comments || []);
      } catch (err) {
        console.error("Error fetching forge:", err);
        setError("Failed to load forge.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Add new comment to the forge
  const handleAddComment = useCallback(
    async (content: string, parentId: number | null) => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `/api/v1/projects/${id}/comments`,
          { content, parent_id: parentId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // For simplicity, reload comments after posting
        window.location.reload();
      } catch (err) {
        console.error("Error adding comment:", err);
      }
    },
    [id]
  );

  // Handle user joining the forge as collaborator
  const handleJoinAsCollaborator = async () => {
    setJoinLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/v1/projects/${id}/add_collaborator`,
        { collaborator_id: currentUser.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProject((prev) =>
        prev
          ? {
              ...prev,
              collaborators: prev.collaborators
                ? [...prev.collaborators, currentUser]
                : [currentUser],
            }
          : prev
      );
    } catch (err) {
      console.error("Error joining forge:", err);
    } finally {
      setJoinLoading(false);
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
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography color="error">{error || "Forge not found."}</Typography>
      </Box>
    );
  }

  const isOwner = currentUser.id === project.user.id;
  const isCollaborator =
    project.collaborators &&
    project.collaborators.some((c) => c.id === currentUser.id);

  return (
    <>
      <Navbar isLoggedIn onLogout={() => navigate("/login")} />

      <Box sx={{ maxWidth: "850px", mx: "auto", p: 3 }}>
        {/* Terminal-style header for the forge */}
        <GeekHeader>
          <ProjectTitle variant="h3">
            {project.title || "Untitled Forge"}
          </ProjectTitle>
          <Typography variant="subtitle2">
            <TerminalIcon
              sx={{
                verticalAlign: "middle",
                mr: 0.5,
              }}
              fontSize="small"
            />
            {project.user?.name || project.user?.username} @ The Forge
          </Typography>
        </GeekHeader>

        {/* FORGE CARD */}
        <Box
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: 3,
            mb: 4,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* FORGE AUTHOR INFO */}
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/users/${project.user.id}`)}
          >
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 40,
                height: 40,
                fontSize: "1rem",
              }}
            >
              {project.user.name?.charAt(0) || project.user.username.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="600">
                {project.user.name || project.user.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created {moment(project.created_at).fromNow()}
              </Typography>
            </Box>
          </Box>

          {/* FORGE DESCRIPTION */}
          {project.description && (
            <Typography
              variant="body1"
              sx={{
                fontFamily: "'Ubuntu Mono', monospace",
                lineHeight: 1.6,
                backgroundColor: "background.default",
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              {project.description}
            </Typography>
          )}

          {/* OPTIONAL FORGE DETAILS */}
          <Box sx={{ mt: 2 }}>
            {project.tech_stack && (
              <Chip
                label={`Tech Stack: ${project.tech_stack}`}
                variant="outlined"
                sx={{
                  fontFamily: "'Ubuntu Mono', monospace",
                  mb: 1,
                  mr: 1,
                  cursor: "default",
                }}
              />
            )}
            {project.schema_url && (
              <Chip
                label="Schema"
                variant="outlined"
                icon={<CodeIcon />}
                onClick={() => window.open(project.schema_url, "_blank")}
                sx={{
                  fontFamily: "'Ubuntu Mono', monospace",
                  mb: 1,
                  mr: 1,
                  cursor: "pointer",
                }}
              />
            )}
            {project.flowchart_url && (
              <Chip
                label="Flowchart"
                variant="outlined"
                icon={<LanguageIcon />}
                onClick={() => window.open(project.flowchart_url, "_blank")}
                sx={{
                  fontFamily: "'Ubuntu Mono', monospace",
                  mb: 1,
                  mr: 1,
                  cursor: "pointer",
                }}
              />
            )}
            {project.collaborators && project.collaborators.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ mr: 1 }}>
                  Collaborators:
                </Typography>
                {project.collaborators.map((collaborator) => (
                  <Chip
                    key={collaborator.id}
                    label={collaborator.username}
                    size="small"
                    sx={{
                      fontFamily: "'Ubuntu Mono', monospace",
                      mr: 0.5,
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* JOIN AS COLLABORATOR BUTTON */}
          {!isOwner && !isCollaborator && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleJoinAsCollaborator}
                disabled={joinLoading}
              >
                {joinLoading ? "Joining..." : "Join as Collaborator"}
              </Button>
            </Box>
          )}

          <Divider />

          {/* FORGE LINKS */}
          <Box display="flex" flexDirection="column" gap={1}>
            {project.repo_link && (
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Git Repository">
                  <CodeIcon fontSize="small" color="primary" />
                </Tooltip>
                <CodeLinkChip
                  label={project.repo_link}
                  variant="outlined"
                  onClick={() => window.open(project.repo_link, "_blank")}
                />
              </Box>
            )}
            {project.live_site_link && (
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Live Site">
                  <LanguageIcon fontSize="small" color="secondary" />
                </Tooltip>
                <CodeLinkChip
                  label={project.live_site_link}
                  variant="outlined"
                  onClick={() => window.open(project.live_site_link, "_blank")}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* COMMENTS SECTION */}
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
          Forge Discussions
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

        {/* COMMENT BOX */}
        <Box
          sx={{
            mt: 4,
            position: "sticky",
            bottom: 24,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            fullWidth
            multiline
            minRows={3}
            variant="outlined"
            placeholder="Start a discussion about this forge..."
            value={mainComment}
            onChange={(e) => setMainComment(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              sx: {
                borderRadius: 2,
                fontFamily: "'Ubuntu Mono', monospace",
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
              Start Discussion
            </StyledButton>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ProjectPage;
