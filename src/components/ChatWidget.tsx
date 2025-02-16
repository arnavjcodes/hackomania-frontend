// ChatWidget.tsx
import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  TextField,
  Button,
  Fab,
  useTheme,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import ReactMarkdown from "react-markdown";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatWidget: React.FC = () => {
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const toggleChat = () => {
    setOpen((prev) => !prev);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Append user's message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    try {
      const response = await axios.post<{ response: string }>("/api/v1/chat", {
        message: input,
      });
      // Append bot's response (in Markdown)
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Unable to fetch response." },
      ]);
    }
    setInput("");
  };

  return (
    <>
      {open && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 160,
            right: 20,
            width: 350,
            height: 500,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: 3,
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : theme.palette.primary.main,
              color: theme.palette.text.primary,
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Emperor Bot</Typography>
            <IconButton
              onClick={toggleChat}
              sx={{ color: theme.palette.text.primary }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              p: 1,
              overflowY: "auto",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <List sx={{ padding: 0 }}>
              {messages.map((msg, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent:
                      msg.sender === "user" ? "flex-end" : "flex-start",
                    alignItems: "flex-start",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor:
                        msg.sender === "user"
                          ? theme.palette.mode === "dark"
                            ? theme.palette.grey[800]
                            : theme.palette.primary.light
                          : theme.palette.mode === "dark"
                          ? theme.palette.grey[700]
                          : theme.palette.grey[200],
                      color: theme.palette.text.primary,
                      p: 1,
                      borderRadius: theme.shape.borderRadius,
                      maxWidth: "75%",
                    }}
                  >
                    {msg.sender === "bot" ? (
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    ) : (
                      msg.text
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: "flex" }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask me anything..."
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSend}
                sx={{ ml: 1 }}
              >
                Send
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Floating Chat Toggle Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 25,
          right: 100,
          zIndex: 1100,
        }}
        onClick={toggleChat}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </>
  );
};

export default ChatWidget;
