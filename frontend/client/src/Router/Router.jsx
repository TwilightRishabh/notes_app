import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "../components/NavBar.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Signup from "../pages/Signup.jsx";
import NotesDashboard from "../pages/NotesDashboard.jsx";
import ArchivedNotes from "../pages/ArchivedNotes.jsx";
import TrashNotes from "../pages/TrashNotes.jsx";

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function AppRouter() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/archived" element={<ArchivedNotes />} />
        <Route path="/trash" element={<TrashNotes />} />

        

      </Routes>
    </>
  );
}
