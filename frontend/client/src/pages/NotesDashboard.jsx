import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NotesDashboard() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedNote, setSelectedNote] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const navigate = useNavigate();

  /* ---------------- Lock background scroll ---------------- */
  useEffect(() => {
    document.body.style.overflow = selectedNote ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedNote]);

  /* ---------------- Fetch Notes ---------------- */
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

  /* ---------------- Search Filter ---------------- */
  const filteredNotes = useMemo(() => {
    const q = search.toLowerCase();
    return notes.filter(
      (n) =>
        n.title?.toLowerCase().includes(q) ||
        n.content?.toLowerCase().includes(q)
    );
  }, [notes, search]);

  /* ---------------- Highlight helper ---------------- */
  const highlightText = (text, query) => {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");

    return text.split(regex).map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span
          key={i}
          className="bg-yellow-200 text-black px-1 rounded"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  /* ---------------- Open Note ---------------- */
  const openNote = (note) => {
    setSelectedNote(note);
    setModalTitle(note.title || "");
    setModalContent(note.content || "");
  };

  /* ---------------- Close Modal (Auto Save / Delete) ---------------- */
  const closeModal = async () => {
    if (!selectedNote) return;

    const title = modalTitle.trim();
    const content = modalContent.trim();
    const token = localStorage.getItem("token");

    try {
      if (!title && !content && selectedNote._id) {
        await axios.delete(
          `http://localhost:5000/api/notes/${selectedNote._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotes((prev) =>
          prev.filter((n) => n._id !== selectedNote._id)
        );
      } else {
        let res;
        if (selectedNote._id) {
          res = await axios.put(
            `http://localhost:5000/api/notes/${selectedNote._id}`,
            { title, content },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setNotes((prev) =>
            prev.map((n) =>
              n._id === res.data._id ? res.data : n
            )
          );
        } else {
          res = await axios.post(
            "http://localhost:5000/api/notes",
            { title, content },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setNotes((prev) => [res.data, ...prev]);
        }
      }
    } catch (err) {
      console.error("Auto save failed", err);
    }

    setSelectedNote(null);
  };

  /* ---------------- Instant Delete ---------------- */
  const instantDelete = async (e) => {
    e.stopPropagation();
    if (!selectedNote?._id) return;

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
    <div className="min-h-screen bg-gray-100 px-6 py-6">
      <div className="max-w-6xl mx-auto">

        {/* Search */}
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-lg shadow-gray-400 shadow-md outline-none border-none focus:ring-1 focus:ring-green-300"
        />

        {/* Notes / Empty */}
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[65vh] text-center text-gray-500">
            <h2 className="text-lg font-semibold">
              {search ? "No matching notes" : "No notes yet"}
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note._id}
                onClick={() => openNote(note)}
                className="bg-white p-4 rounded-xl shadow hover:shadow-md cursor-pointer"
              >
                <h3 className="font-semibold mb-2 truncate">
                  {highlightText(note.title || "Untitled", search)}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-4">
                  {highlightText(note.content || "", search)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating + */}
      <button
        onClick={() => {
          setSelectedNote({ _id: null });
          setModalTitle("");
          setModalContent("");
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700 active:scale-95 transition z-50"
      >
        <span className="text-3xl leading-none">+</span>
      </button>

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
            <div className="flex items-center gap-3 mb-4">
              <input
                className="w-full text-2xl font-bold outline-none"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                placeholder="Title"
              />

              <button
                onMouseDown={instantDelete}
                className="text-xl hover:scale-110 transition"
              >
                ❌
              </button>
            </div>

            <textarea
              className="w-full min-h-[200px] outline-none resize-none"
              value={modalContent}
              onChange={(e) => setModalContent(e.target.value)}
              placeholder="Take a note..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesDashboard;
