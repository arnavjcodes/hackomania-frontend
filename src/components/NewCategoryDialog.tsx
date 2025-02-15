// NewCategoryDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

interface NewCategoryDialogProps {
  open: boolean;
  onClose: () => void;
}

const NewCategoryDialog: React.FC<NewCategoryDialogProps> = ({
  open,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateCategory = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/v1/categories",
        {
          category: {
            name,
            description,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Category created:", response.data);

      // Clear the form and close the dialog
      setName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Failed to create category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      // Blurred backdrop
      BackdropProps={{
        style: {
          backdropFilter: "blur(4px)",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold" }}>New Category</DialogTitle>

      <DialogContent dividers>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <TextField
          label="Category Name"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextField
          label="Description"
          variant="outlined"
          fullWidth
          multiline
          minRows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleCreateCategory}
          disabled={loading}
          sx={{
            bgcolor: "#88c0d0",
            "&:hover": { bgcolor: "#729cb4" },
          }}
        >
          {loading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Create Category"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewCategoryDialog;
