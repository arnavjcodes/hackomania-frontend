import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import SetupPreferences from "../pages/Preferences";
import SettingsPage from "../pages/Settings";
import ThreadPage from "../pages/ThreadPage";
import CategoriesPage from "../pages/Categories";
import CategoryDetailsPage from "../pages/CategoryDetails";
import ProfilePage from "../pages/Profile";
import ExplorePage from "../pages/ExplorePage";
import ProjectPage from "../pages/ProjectPage";
import ProjectsPage from "../pages/ProjectsPage";
import MeetupPage from "../pages/MeetupPage";
import MeetupDetail from "../pages/MeetupDetail";
import CreateResourcePage from "../pages/CreateResource";
import ChatWidget from "../components/ChatWidget";

import ResourcesPage from "../pages/AllResourcesPage";
import ResourceDetailPage from "../pages/ResourceDetailPage";
import { Chat } from "@mui/icons-material";

interface AppRoutesProps {
  token: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ token, setToken, logout }) => {
  return (
    <Routes>
      {/* Redirect to login if no token */}
      <Route
        path="/login"
        element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />}
      />

      <Route
        path="/preferences"
        element={token ? <SetupPreferences /> : <Navigate to="/login" />}
      />

      <Route
        path="/"
        element={token ? <Home logout={logout} /> : <Navigate to="/login" />}
      />

      <Route
        path="/settings"
        element={token ? <SettingsPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/forum_threads/:id"
        element={token ? <ThreadPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/categories/:id"
        element={token ? <CategoriesPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/categories"
        element={token ? <CategoriesPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/category/:id"
        element={token ? <CategoryDetailsPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/profile"
        element={token ? <ProfilePage /> : <Navigate to="/login" />}
      />

      <Route
        path="/users/:userId"
        element={token ? <ProfilePage /> : <Navigate to="/login" />}
      />

      <Route
        path="/explore"
        element={token ? <ExplorePage /> : <Navigate to="/login" />}
      />

      <Route
        path="/projects/:id"
        element={token ? <ProjectPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/projects"
        element={token ? <ProjectsPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/meetup"
        element={token ? <MeetupPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/meetups/:id"
        element={token ? <MeetupDetail /> : <Navigate to="/login" />}
      />

      <Route
        path="/createResource"
        element={token ? <CreateResourcePage /> : <Navigate to="/login" />}
      />

      <Route
        path="/createResource"
        element={token ? <CreateResourcePage /> : <Navigate to="/login" />}
      />

      <Route
        path="/resources"
        element={token ? <ResourcesPage /> : <Navigate to="/login" />}
      />

      <Route
        path="/resources/:id"
        element={token ? <ResourceDetailPage /> : <Navigate to="/login" />}
      />
    </Routes>
  );
};

export default AppRoutes;
