import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ArchivedNotes() {

  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedNote, setSelectedNote] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  /* Lock scroll while modal open */
  useEffect(() => {
    document.body.style.overflow = selectedNote ? "hidden" : "auto";
  }, [selectedNote]);

  /* Fetch notes */
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ESC closes modal */
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape" && selectedNote) handleClose(true);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [selectedNote, modalTitle, modalContent]);

  /* ---------- 🔍 SEARCH HIGHLIGHT ---------- */
  const highlight = (text = "", q) => {
    if (!q.trim()) return text;
    const regex = new RegExp(`(${q})`, "gi");

    return text.split(regex).map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span key={i} className="bg-yellow-200 px-1 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  /* ---------- GROUP: ARCHIVED (Pinned + Others) ---------- */
  const { pinnedArchived, otherArchived } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const archived = notes.filter(n => n.isArchived);

    const filtered = q
      ? archived.filter(
          n =>
            n.title?.toLowerCase().includes(q) ||
            n.content?.toLowerCase().includes(q)
        )
      : archived;

    return {
      pinnedArchived: filtered.filter(n => n.isPinned),
      otherArchived: filtered.filter(n => !n.isPinned),
    };

  }, [notes, search]);

  /* ---------- OPEN NOTE ---------- */
  const openNote = (note) => {
    setSelectedNote(note);
    setModalTitle(note.title || "");
    setModalContent(note.content || "");
    setMenuOpen(false);
  };

  /* ---------- CLOSE WITH ANIMATION ---------- */
  const handleClose = async (clickedOutside = false) => {
    if (isClosing) return;
    setIsClosing(true);

    await closeModal(clickedOutside);

    setTimeout(() => {
      setIsClosing(false);
      setMenuOpen(false);
    }, 180);
  };

  /* ---------- SAVE NOTE ---------- */
  const closeModal = async (clickedOutside) => {
    if (!selectedNote) return;

    const title = modalTitle.trim();
    const content = modalContent.trim();
    const token = localStorage.getItem("token");

    if (
      clickedOutside &&
      title === (selectedNote.title || "").trim() &&
      content === (selectedNote.content || "").trim()
    ) {
      return setSelectedNote(null);
    }

    if (!title && !content) {
      await axios.delete(
        `http://localhost:5000/api/notes/${selectedNote._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(prev => prev.filter(n => n._id !== selectedNote._id));
      return setSelectedNote(null);
    }

    const res = await axios.put(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      { title, content },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes(prev =>
      prev.map(n => (n._id === res.data._id ? res.data : n))
    );

    setSelectedNote(null);
  };

  /* ---------- PIN / UNPIN ---------- */
  const togglePin = async (note) => {
    if (!note?._id) return;

    const token = localStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:5000/api/notes/${note._id}`,
      {
        title: note.title ?? "",
        content: note.content ?? "",
        isPinned: !Boolean(note.isPinned),
        isArchived: true
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes(prev =>
      prev.map(n => (n._id === res.data._id ? res.data : n))
    );

    if (selectedNote && selectedNote._id === res.data._id) {
      setSelectedNote(res.data);
    }
  };

  /* ---------- UNARCHIVE ---------- */
  const unarchiveNote = async () => {
    if (!selectedNote?._id) return;

    const token = localStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      {
        ...selectedNote,
        isArchived: false
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes(prev =>
      prev.map(n => (n._id === res.data._id ? res.data : n))
    );

    setSelectedNote(null);
    setMenuOpen(false);
  };

  /* ---------- DELETE ---------- */
  const deleteNote = async () => {
    if (!selectedNote?._id) return;

    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes(prev => prev.filter(n => n._id !== selectedNote._id));
    setSelectedNote(null);
    setMenuOpen(false);
  };

  /* ---------- PIN ICON ---------- */
  const PinIcon = ({ active }) => (
    <svg className="cursor-pointer" width="20" height="20" viewBox="0 0 24 24">
      <path
        fill={active ? "#059669" : "none"}
        stroke="#059669"
        strokeWidth="1.6"
        d="M12 2l4 4-2 2 3 7-2 2-7-3-2 2-4-4 2-2-3-7 2-2 7 3z"
      />
    </svg>
  );

  /* ---------- EMPTY STATE ---------- */
  const EmptyArchived = () => (
    <div className="flex flex-col items-center justify-center h-[55vh] text-gray-600">
      <svg width="60" height="60" viewBox="0 0 24 24" className="mb-2">
        <path fill="#6b7280" d="M6 4h12l2 4H4l2-4zm-2 6h16v10H4V10z"/>
      </svg>
      <p className="font-medium">No archived notes</p>
      <p className="text-sm opacity-70">Archived notes appear here</p>
    </div>
  );

  if (isLoading)
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-emerald-700">Loading…</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-emerald-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search archived notes..."
          className="w-full mb-8 px-4 py-3 rounded-lg bg-white border border-emerald-200 focus:ring-2 focus:ring-emerald-300"
        />

        {pinnedArchived.length === 0 && otherArchived.length === 0 && <EmptyArchived />}

        {/* ---------- PINNED ARCHIVED ---------- */}
        {pinnedArchived.length > 0 && (
          <>
            <p className="text-sm font-semibold text-emerald-700 mb-2">PINNED</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {pinnedArchived.map(n => (
                <div
                  key={n._id}
                  onClick={() => openNote(n)}
                  className="relative bg-white rounded-xl p-5 border shadow-sm hover:shadow-md cursor-pointer transition"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(n); }}
                    className="absolute top-3 right-3 scale-95 hover:scale-110 transition"
                  >
                    <PinIcon active={n.isPinned} />
                  </button>

                  <h3 className="font-semibold mb-2 truncate">
                    {highlight(n.title || "Untitled", search)}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-3">
                    {highlight(n.content || "", search)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------- OTHER ARCHIVED ---------- */}
        {otherArchived.length > 0 && (
          <>
            <p className="text-sm font-semibold text-emerald-700 mb-2">ARCHIVED</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherArchived.map(n => (
                <div
                  key={n._id}
                  onClick={() => openNote(n)}
                  className="
        relative bg-white rounded-xl p-5
        border border-emerald-100
        hover:border-emerald-300
        shadow-sm hover:shadow-md
        transition-all duration-200 cursor-pointer
      "
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePin(n); }}
                    className="absolute top-3 right-3 opacity-70 scale-95 hover:scale-110 transition"
                  >
                    <PinIcon active={n.isPinned} />
                  </button>

                  <h3 className="font-semibold mb-2 truncate">
                    {highlight(n.title || "Untitled", search)}
                  </h3>

                  <p className="text-sm text-gray-600 line-clamp-3">
                    {highlight(n.content || "", search)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* ---------- MODAL ---------- */}
      {selectedNote && (
        <div
          onMouseDown={() => handleClose(true)}
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
            isClosing ? "opacity-0 transition" : ""
          }`}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className={`bg-white w-[90%] max-w-2xl rounded-xl p-6 shadow-xl ${
              isClosing ? "scale-95" : "scale-100"
            } transition-all duration-200`}
          >
            <div className="flex justify-between items-center mb-2">
              <input
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                className="w-full text-2xl font-semibold outline-none"
              />

              <button
                onClick={() => togglePin(selectedNote)}
                className="scale-95 hover:scale-110 transition"
              >
                <PinIcon active={selectedNote.isPinned} />
              </button>
            </div>

            <textarea
              value={modalContent}
              onChange={(e) => setModalContent(e.target.value)}
              className="w-full min-h-[220px] outline-none resize-none"
            />

            <div className="relative flex justify-end mt-4 gap-3">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="px-3 py-1 border rounded"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute bottom-12 right-0 bg-white border rounded shadow px-3 py-2 w-28">
                  <button onClick={unarchiveNote} className="block w-full text-left mb-1">
                    Unarchive
                  </button>

                  <button onClick={deleteNote} className="block w-full text-left text-red-600">
                    Delete
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ArchivedNotes;
