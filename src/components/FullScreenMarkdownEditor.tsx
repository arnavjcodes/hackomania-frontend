// src/components/FullScreenMarkdownEditor.tsx
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/material/styles";

interface FullScreenMarkdownEditorProps {
  initialMarkdown: string;
  onChange: (markdown: string) => void;
  onClose: () => void;
}

// Sidebar
const Sidebar = styled(Box)(({ theme }) => ({
  width: 220,
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  overflowY: "auto",
  padding: theme.spacing(2),
}));

// Container for the editor and preview columns
const EditorContainer = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "row",
  overflow: "hidden",
}));

// Column that holds the TextField editor
const EditorColumn = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
  backgroundColor: theme.palette.mode === "dark" ? "#141414" : "#f5f5f5",
  borderRight: `1px solid ${theme.palette.divider}`,
}));

// Column that holds the markdown preview
const PreviewColumn = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: "auto",
  backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#ffffff",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(1),
}));

const FullScreenMarkdownEditor: React.FC<FullScreenMarkdownEditorProps> = ({
  initialMarkdown,
  onChange,
  onClose,
}) => {
  const theme = useTheme();
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [headings, setHeadings] = useState<string[]>([]);

  // Extract headings from markdown (lines that start with #)
  useEffect(() => {
    const regex = /^(#{1,6})\s+(.*)$/gm;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      matches.push(match[2]);
    }
    setHeadings(matches);
  }, [markdown]);

  const handleEditorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMarkdown = e.target.value;
    setMarkdown(newMarkdown);
    onChange(newMarkdown);
  };

  // Scroll to section when clicking a heading in the sidebar
  const scrollToHeading = (heading: string) => {
    // Convert heading to an ID (replace spaces, punctuation, etc.)
    const id = heading
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .toLowerCase();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Dialog fullScreen open onClose={onClose}>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor:
            theme.palette.mode === "dark"
              ? "#000000"
              : theme.palette.primary.main,
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={onClose}
            aria-label="close"
            sx={{ color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontFamily: '"Press Start 2P", monospace' }}
          >
            Full Screen Markdown Editor
          </Typography>
          <Button onClick={onClose} sx={{ color: "#fff" }}>
            Done
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        display="flex"
        height="100%"
        bgcolor={theme.palette.mode === "dark" ? "#000" : "#f5f5f5"}
      >
        {/* Sidebar */}
        <Sidebar>
          <SectionTitle
            variant="subtitle1"
            gutterBottom
            sx={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Sections
          </SectionTitle>
          <Divider sx={{ mb: 2 }} />
          {headings.length ? (
            <List dense disablePadding>
              {headings.map((heading, idx) => (
                <ListItem key={idx} sx={{ p: 0, marginBottom: 0.5 }}>
                  <ListItemButton
                    onClick={() => scrollToHeading(heading)}
                    sx={{
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? "rgba(255,255,255,0.08)"
                            : "rgba(0,0,0,0.04)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={heading}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        fontWeight: 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No headings found.
            </Typography>
          )}
        </Sidebar>

        {/* Editor & Preview Columns */}
        <EditorContainer>
          {/* Editor */}
          <EditorColumn>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
            >
              Editor
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={22}
              variant="outlined"
              placeholder="Write your markdown here..."
              value={markdown}
              onChange={handleEditorChange}
              InputProps={{
                sx: {
                  bgcolor: "inherit",
                  borderRadius: 2,
                  color: "text.primary",
                  fontFamily: "Consolas, 'Courier New', monospace",
                },
              }}
            />
          </EditorColumn>

          {/* Preview */}
          <PreviewColumn>
            <Typography
              variant="body2"
              sx={{ mb: 1, color: "text.secondary", fontWeight: 600 }}
            >
              Preview
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                bgcolor: "inherit",
                color: "text.primary",
                p: 2,
                borderRadius: 2,
                minHeight: "calc(100% - 30px)",
                overflowY: "auto",
              }}
            >
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => (
                    <h1 id={makeHeadingId(props.children)} {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 id={makeHeadingId(props.children)} {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 id={makeHeadingId(props.children)} {...props} />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4 id={makeHeadingId(props.children)} {...props} />
                  ),
                  h5: ({ node, ...props }) => (
                    <h5 id={makeHeadingId(props.children)} {...props} />
                  ),
                  h6: ({ node, ...props }) => (
                    <h6 id={makeHeadingId(props.children)} {...props} />
                  ),
                }}
              >
                {markdown}
              </ReactMarkdown>
            </Paper>
          </PreviewColumn>
        </EditorContainer>
      </Box>
    </Dialog>
  );
};

/**
 * Convert heading text to an ID by removing punctuation and spaces.
 */
function makeHeadingId(children: React.ReactNode): string {
  if (!children) return "";
  const headingText = Array.isArray(children)
    ? children.join(" ")
    : (children as string);
  return headingText
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "")
    .toLowerCase();
}

export default FullScreenMarkdownEditor;
