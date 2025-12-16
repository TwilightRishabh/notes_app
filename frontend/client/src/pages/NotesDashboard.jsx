import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NotesDashboard() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [error, setError] = useState("");
  const [shakeError, setShakeError] = useState(false);

  const [selectedNote, setSelectedNote] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const navigate = useNavigate();

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = selectedNote ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedNote]);

  // Fetch notes
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get("http://localhost:5000/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotes(res.data);
    } catch {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Add note
  const handleAdd = async () => {
    if (!title.trim() && !content.trim()) {
      setError("Enter title or content");
      setShakeError(false);
      requestAnimationFrame(() => setShakeError(true));
      return;
    }

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
      setError("");
    } catch {
      setError("Failed to add note");
    }
  };

  // Open note
  const openNote = (note) => {
    setSelectedNote(note);
    setModalTitle(note.title || "");
    setModalContent(note.content || "");
  };

  // Close modal → auto save or delete
  const closeModal = async () => {
    if (!selectedNote) return;

    const trimmedTitle = modalTitle.trim();
    const trimmedContent = modalContent.trim();
    const token = localStorage.getItem("token");

    try {
      if (!trimmedTitle && !trimmedContent) {
        // DELETE
        await axios.delete(
          `http://localhost:5000/api/notes/${selectedNote._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotes((prev) =>
          prev.filter((n) => n._id !== selectedNote._id)
        );
      } else {
        // UPDATE
        const res = await axios.put(
          `http://localhost:5000/api/notes/${selectedNote._id}`,
          { title: trimmedTitle, content: trimmedContent },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotes((prev) =>
          prev.map((n) =>
            n._id === selectedNote._id ? res.data : n
          )
        );
      }
    } catch (err) {
      console.error("Auto save failed", err);
    }

    setSelectedNote(null);
  };

  // Instant delete (icon)
  const instantDelete = async (e) => {
    e.stopPropagation();
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `http://localhost:5000/api/notes/${selectedNote._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prev) =>
        prev.filter((n) => n._id !== selectedNote._id)
      );
    } catch (err) {
      console.error("Delete failed", err);
    }

    setSelectedNote(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notes Dashboard</h1>

        {/* Add Note */}
        <div className="bg-white p-5 rounded-xl shadow-md mb-8">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-3"
          />
          <textarea
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded mb-3 resize-none"
          />

          <div className="h-6 mb-2">
            {error && (
              <p
                className="text-red-600 text-sm inline-block"
                style={{
                  animation: shakeError ? "shakeX 0.6s" : "none",
                }}
              >
                ⚠ {error}
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
          >
            Add Note
          </button>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              onMouseDown={() => openNote(note)}
              className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md"
            >
              <h3 className="font-semibold mb-2">{note.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-4">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedNote && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onMouseDown={closeModal}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="bg-white w-[90%] max-w-2xl max-h-[80vh] rounded-xl p-6 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <input
                className="w-full text-2xl font-bold outline-none"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                placeholder="Title"
              />

              
              <button
                onMouseDown={instantDelete}
                className="cursor-pointer ml-4 text-white-600 invert-100 hover:invert-80 transition-all duration-300 text-2xl"
                title="Delete note"
              >
                ❎
              </button>

              
              
            </div>

            <textarea
              className="w-full min-h-[200px] outline-none resize-none"
              value={modalContent}
              onChange={(e) => setModalContent(e.target.value)}
              placeholder="Take a note..."
            />

            <p className="text-xs text-gray-400 mt-4">
              Click outside to save • Clear both to delete
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesDashboard;
