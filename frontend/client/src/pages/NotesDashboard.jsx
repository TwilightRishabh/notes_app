import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NotesDashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [error, setError] = useState(""); // 🔴 validation message


  const [shakeError, setShakeError] = useState(false);

  


  const navigate = useNavigate();

  // -----------------------------
  // Fetch Notes
  // -----------------------------
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes(res.data);
    } catch (error) {
      console.log("Fetch notes error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // -----------------------------
  // Add New Note
  // -----------------------------
  const handleAdd = async () => {
    if (!title.trim() || !content.trim()) {
  setError("Please enter both title and content.");

  // force re-trigger animation
  setShakeError(false);
  requestAnimationFrame(() => setShakeError(true));
  return;
}

    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/notes",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prev) => [res.data, ...prev]);
      setTitle("");
      setContent("");
    } catch (error) {
      console.log("Add note error:", error);
      setError(error.response?.data?.message || "Failed to add note");
    }
  };

  // -----------------------------
  // Start Editing
  // -----------------------------
  const startEdit = (note) => {
    setIsEditing(true);
    setEditId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setError("");
  };

  // -----------------------------
  // Update Note
  // -----------------------------
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Please enter both title and content.");
      return;
    }

    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `http://localhost:5000/api/notes/${editId}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prev) =>
        prev.map((note) =>
          note._id === editId ? res.data : note
        )
      );

      setIsEditing(false);
      setEditId(null);
      setTitle("");
      setContent("");
    } catch (error) {
      console.log("Update note error:", error);
      setError(error.response?.data?.message || "Failed to update note");
    }
  };

  // -----------------------------
  // Delete Note
  // -----------------------------
  const handleDelete = async (noteId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );
    if (!confirmDelete) return;

    const backup = notes;
    setNotes((prev) => prev.filter((n) => n._id !== noteId));

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.log("Delete note error:", error);
      setNotes(backup);
      setError(error.response?.data?.message || "Failed to delete note");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notes Dashboard</h1>

        {/* Add / Edit Card */}
        <div className="bg-white p-5 rounded-xl shadow-md mb-8">
          <input
            type="text"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <textarea
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          
        <div className="h-6 mb-3">
          {error && (
            <p
              style={{
                display: "inline-block",
                animation: shakeError ? "shakeX 0.6s" : "none",
              }}
            className="text-red-600 text-sm mb-3"
            >
            ⚠️ {error}
            </p>
            )}
        </div>

          {isEditing ? (
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
            >
              Update Note
            </button>
          ) : (
            <button
              onClick={handleAdd}
              className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700"
            >
              Add Note
            </button>
          )}
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <p className="text-gray-500">No notes yet...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg mb-2">
                  {note.title}
                </h3>

                <p className="text-gray-600 text-sm line-clamp-4">
                  {note.content}
                </p>

                <p className="text-xs text-gray-400 mt-3">
                  {new Date(note.createdAt).toLocaleString()}
                </p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => startEdit(note)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NotesDashboard;
