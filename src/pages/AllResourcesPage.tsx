// src/pages/AllResourcesPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
} from "@mui/material";
import Navbar from "../components/layout/Navbar";

interface User {
  id: number;
  username: string;
  name: string | null;
}

interface Tag {
  id: number;
  name: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  content: string;
  resource_type: string;
  url: string;
  published: boolean;
  approved: boolean;
  view_count: number;
  rating: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  user: User;
  tags: Tag[];
}

const resourceTypes = ["Algorithm", "Setup Guide", "Insight", "Software"];

const sortOptions = [
  { value: "rating", label: "Rating" },
  { value: "views", label: "Views" },
  { value: "created_at", label: "Newest" },
];

const AllResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and sorting state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("");

  const navigate = useNavigate();

  // Fetch resources using query parameters
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const params: any = {};
      if (searchQuery) params.q = searchQuery;
      if (selectedType) params.resource_type = selectedType;
      if (selectedTag) params.tag = selectedTag;
      if (sortOrder) params.order = sortOrder;

      const res = await axios.get("/api/v1/resources", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setResources(res.data);
    } catch (err) {
      console.error("Error fetching resources:", err);
      setError("Failed to load The Vault. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reload resources whenever a filter changes
  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedType, selectedTag, sortOrder]);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        color: "text.primary",
      }}
    >
      <Navbar isLoggedIn onLogout={() => navigate("/login")} />
      <Box sx={{ maxWidth: 1200, mx: "auto", p: 4 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            fontWeight: "bold",
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          ./vault
        </Typography>

        {/* Filter & Search Section */}
        <Box
          component="form"
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            mb: 4,
            alignItems: "center",
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel id="resource-type-select-label">Type</InputLabel>
            <Select
              labelId="resource-type-select-label"
              label="Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {resourceTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Tag"
            variant="outlined"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            sx={{ minWidth: 150 }}
          />
          <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-order-select-label">Sort By</InputLabel>
            <Select
              labelId="sort-order-select-label"
              label="Sort By"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <MenuItem value="">
                <em>Default</em>
              </MenuItem>
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={fetchResources}>
            Refresh
          </Button>
        </Box>

        {/* The Vault List */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : resources.length === 0 ? (
          <Typography>
            No items found in The Vault. Try a different search or filter.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {resources.map((resource) => (
              <Grid item xs={12} sm={6} md={4} key={resource.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "background.paper",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.02)" },
                  }}
                  onClick={() => navigate(`/resources/${resource.id}`)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: '"Press Start 2P", monospace',
                        mb: 1,
                      }}
                    >
                      {resource.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, color: "text.secondary" }}
                    >
                      {resource.description}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ flexWrap: "wrap", mb: 1 }}
                    >
                      {resource.tags.map((tag) => (
                        <Chip
                          key={tag.id}
                          label={`#${tag.name}`}
                          size="small"
                        />
                      ))}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {resource.resource_type} | Rating: {resource.rating} |
                      Views: {resource.view_count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default AllResourcesPage;
