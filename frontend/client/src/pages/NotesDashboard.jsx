import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NotesDashboard() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedNote, setSelectedNote] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  /* Lock scroll when modal open */
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

  /* ---------- FILTER + GROUP (exclude archived) ---------- */
  const { pinnedNotes, otherNotes } = useMemo(() => {
    const q = search.trim().toLowerCase();

    const visible = notes.filter((n) => !n.isArchived);

    const filtered = q
      ? visible.filter(
          (n) =>
            n.title?.toLowerCase().includes(q) ||
            n.content?.toLowerCase().includes(q)
        )
      : visible;

    return {
      pinnedNotes: filtered.filter((n) => n.isPinned),
      otherNotes: filtered.filter((n) => !n.isPinned),
    };
  }, [notes, search]);

  /* ---------- SEARCH HIGHLIGHT ---------- */
  const highlight = (text, q) => {
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

  /* ---------- PIN ---------- */
  const togglePin = async (note) => {
    if (!note?._id) return;
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:5000/api/notes/${note._id}`,
      {
        title: note.title ?? "",
        content: note.content ?? "",
        isPinned: !Boolean(note.isPinned),
        isArchived: note.isArchived ?? false,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((prev) =>
      prev.map((n) => (n._id === res.data._id ? res.data : n))
    );

    if (selectedNote && selectedNote._id === res.data._id) {
      setSelectedNote(res.data);
    }
  };

  /* ---------- ARCHIVE ---------- */
  const toggleArchive = async () => {
    if (!selectedNote?._id) return;

    const token = localStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      {
        title: selectedNote.title ?? "",
        content: selectedNote.content ?? "",
        isArchived: !Boolean(selectedNote.isArchived),
        isPinned: false,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((prev) =>
      prev.map((n) => (n._id === res.data._id ? res.data : n))
    );

    setSelectedNote(null);
    setMenuOpen(false);
  };

  /* ---------- OPEN NOTE ---------- */
  const openNote = (note) => {
    setSelectedNote(note);
    setModalTitle(note.title || "");
    setModalContent(note.content || "");
    setMenuOpen(false);
  };

  /* ---------- CLOSE (with animation) ---------- */
  const handleClose = async (clickedOutside = false) => {
    if (isClosing) return;
    setIsClosing(true);

    await closeModal(clickedOutside);

    setTimeout(() => {
      setIsClosing(false);
      setMenuOpen(false);
    }, 180);
  };

  /* ---------- SAVE / DELETE / CLOSE ---------- */
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

    if (!selectedNote._id && !title && !content) {
      return setSelectedNote(null);
    }

    if (selectedNote._id && !title && !content) {
      await axios.delete(
        `http://localhost:5000/api/notes/${selectedNote._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes((prev) => prev.filter((n) => n._id !== selectedNote._id));
      return setSelectedNote(null);
    }

    if (selectedNote._id) {
      const res = await axios.put(
        `http://localhost:5000/api/notes/${selectedNote._id}`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prev) =>
        prev.map((n) => (n._id === res.data._id ? res.data : n))
      );
    }

    if (!selectedNote._id) {
      const res = await axios.post(
        "http://localhost:5000/api/notes",
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes((prev) => [res.data, ...prev]);
    }

    setSelectedNote(null);
  };

  /* ---------- DELETE ---------- */
  const deleteNote = async () => {
    if (!selectedNote?._id) return;

    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((prev) => prev.filter((n) => n._id !== selectedNote._id));
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

  /* ---------- EMPTY STATES (UNCHANGED) ---------- */
  const EmptyNotes = () => (
    <div className="flex flex-col items-center justify-center h-[55vh] text-emerald-700">
      <svg width="70" height="70" viewBox="0 0 24 24" className="mb-3">
        <path
          fill="#059669"
          d="M7 3h10v2H7zm0 4h10v2H7zm0 4h6v2H7zm0 4h4v2H7z"
        />
      </svg>
      <p className="font-semibold mb-1">No notes yet</p>
      <p className="text-sm opacity-80">
        Click the + button to create your first note
      </p>
    </div>
  );

  const NoSearchMatch = () => (
    <div className="flex flex-col items-center justify-center h-[40vh] text-gray-600">
      <svg width="65" height="65" viewBox="0 0 24 24" className="mb-3">
        <path
          fill="#6b7280"
          d="M15 14h.79l4.28 4.29-1.42 1.42L14.36 15.4V14l-.27-.28A6.5 6.5 0 1 1 15 14z"
        />
      </svg>
      <p className="font-medium">No matching notes</p>
    </div>
  );

  /* ---------- NOTE CARD ---------- */
  const NoteCard = (note) => (
    <div
      onClick={() => openNote(note)}
      className="
        relative bg-white rounded-xl p-5
        border border-emerald-100
        hover:border-emerald-300
        shadow-sm hover:shadow-md
        transition-all duration-200 cursor-pointer
      "
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePin(note);
        }}
        className="absolute top-3 right-3 scale-95 hover:scale-110 transition"
      >
        <PinIcon active={note.isPinned} />
      </button>

      <h3 className="font-semibold mb-2 truncate text-gray-800">
        {highlight(note.title || "Untitled", search)}
      </h3>

      <p className="text-sm text-gray-600 line-clamp-4">
        {highlight(note.content || "", search)}
      </p>
    </div>
  );

  /* ---------- LOADING ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-emerald-700">Loading notes…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          className="w-full mb-8 px-4 py-3 rounded-lg bg-white border border-emerald-200 focus:ring-2 focus:ring-emerald-300"
        />

        {/* ---------- EMPTY STATES LOGIC (UNCHANGED) ---------- */}
        {notes.filter((n) => !n.isArchived).length === 0 && <EmptyNotes />}

        {notes.length > 0 &&
          pinnedNotes.length === 0 &&
          otherNotes.length === 0 &&
          <NoSearchMatch />}

        {/* PINNED */}
        {pinnedNotes.length > 0 && (
          <>
            <p className="text-sm font-semibold text-emerald-700 mb-2">
              PINNED
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {pinnedNotes.map((n) => (
                <NoteCard key={n._id} {...n} />
              ))}
            </div>
          </>
        )}

        {/* OTHERS */}
        {otherNotes.length > 0 && (
          <>
            <p className="text-sm font-semibold text-emerald-700 mb-2">
              Notes
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherNotes.map((n) => (
                <NoteCard key={n._id} {...n} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* + Button */}
      <button
        onClick={() => openNote({ _id: null })}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition"
      >
        +
      </button>

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
            <div className="flex justify-between items-center mb-3">
              <input
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                placeholder="Title"
                className="w-full text-2xl font-semibold outline-none"
              />

              {selectedNote._id && (
                <button onClick={() => togglePin(selectedNote)}>
                  <PinIcon active={selectedNote.isPinned} />
                </button>
              )}
            </div>

            <textarea
              value={modalContent}
              onChange={(e) => setModalContent(e.target.value)}
              placeholder="Take a note..."
              className="w-full min-h-[220px] outline-none resize-none"
            />

            {/* ---------- NEW DROPDOWN MENU (proper) ---------- */}
            <div className="relative flex justify-end mt-4 gap-3">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="px-3 py-1 border rounded"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="absolute bottom-12 right-0 bg-white border rounded shadow px-3 py-2 w-28">
                  <button
                    onClick={toggleArchive}
                    className="block w-full text-left mb-1"
                  >
                    {selectedNote.isArchived ? "Unarchive" : "Archive"}
                  </button>

                  <button
                    onClick={deleteNote}
                    className="block w-full text-left text-red-600"
                  >
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

export default NotesDashboard;
