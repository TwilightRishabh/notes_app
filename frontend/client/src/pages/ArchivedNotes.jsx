// ⭐ ArchivedNotes — color preserved + perfectly-centered icon

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

  useEffect(() => {
    document.body.style.overflow = selectedNote ? "hidden" : "auto";
  }, [selectedNote]);

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

  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape" && selectedNote) handleClose(true);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [selectedNote, modalTitle, modalContent]);

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

  const { pinnedArchived, otherArchived, totalArchived } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const archived = notes.filter((n) => n.isArchived);

    const filtered = q
      ? archived.filter(
          (n) =>
            n.title?.toLowerCase().includes(q) ||
            n.content?.toLowerCase().includes(q)
        )
      : archived;

    return {
      pinnedArchived: filtered.filter((n) => n.isPinned),
      otherArchived: filtered.filter((n) => !n.isPinned),
      totalArchived: archived.length,
    };
  }, [notes, search]);

  /* ---------- NO SEARCH MATCH (⭐ arrow centered inside box) ---------- */
  const NoSearchMatch = () => (
    <div className="flex flex-col items-center justify-center h-[40vh] text-gray-600">
      <svg width="72" height="72" viewBox="0 0 24 24" className="mb-3">
        {/* Box */}
        <rect
          x="3"
          y="7"
          width="18"
          height="13"
          rx="2"
          ry="2"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2"
        />
        {/* Lid line */}
        <path
          d="M3 10h18"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2"
        />
        {/* ⭐ centered arrow */}
        <path
          d="M12 11v4
             m-3-2 3 3 3-3"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="font-medium">No matching notes</p>
    </div>
  );

  /* ---------- OPEN NOTE ---------- */
  const openNote = (note) => {
    const c = note.color || "#FFFFFF";
    setSelectedNote({ ...note, color: c, colorBeforeEdit: c });
    setModalTitle(note.title || "");
    setModalContent(note.content || "");
    setMenuOpen(false);
  };

  const handleClose = async (clickedOutside = false) => {
    if (isClosing) return;
    setIsClosing(true);
    await closeModal(clickedOutside);
    setTimeout(() => {
      setIsClosing(false);
      setMenuOpen(false);
    }, 180);
  };

  const closeModal = async (clickedOutside) => {
    if (!selectedNote) return;

    const token = localStorage.getItem("token");
    const title = modalTitle.trim();
    const content = modalContent.trim();
    const color = selectedNote.color || "#FFFFFF";

    const prevTitle = (selectedNote.title || "").trim();
    const prevContent = (selectedNote.content || "").trim();
    const prevColor = selectedNote.colorBeforeEdit || selectedNote.color;

    if (
      clickedOutside &&
      title === prevTitle &&
      content === prevContent &&
      color === prevColor
    ) {
      return setSelectedNote(null);
    }

    if (!title && !content) {
      await axios.delete(
        `http://localhost:5000/api/notes/${selectedNote._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes((p) => p.filter((n) => n._id !== selectedNote._id));
      return setSelectedNote(null);
    }

    const res = await axios.put(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      { title, content, color },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((p) => p.map((n) => (n._id === res.data._id ? res.data : n)));
    setSelectedNote(null);
  };

  const togglePin = async (note) => {
    if (!note?._id) return;
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:5000/api/notes/${note._id}`,
      {
        title: note.title ?? "",
        content: note.content ?? "",
        isPinned: !Boolean(note.isPinned),
        isArchived: true,
        color: note.color ?? "#FFFFFF",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((p) => p.map((n) => (n._id === res.data._id ? res.data : n)));

    if (selectedNote && selectedNote._id === res.data._id) {
      setSelectedNote(res.data);
    }
  };

  const unarchiveNote = async () => {
    if (!selectedNote?._id) return;

    const token = localStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      {
        ...selectedNote,
        isArchived: false,
        color: selectedNote.color ?? "#FFFFFF",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((p) => p.map((n) => (n._id === res.data._id ? res.data : n)));
    setSelectedNote(null);
    setMenuOpen(false);
  };

  const deleteNote = async () => {
    if (!selectedNote?._id) return;

    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/notes/${selectedNote._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((p) => p.filter((n) => n._id !== selectedNote._id));
    setSelectedNote(null);
    setMenuOpen(false);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-emerald-700">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-emerald-50 px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search archived notes..."
          className="w-full mb-8 px-4 py-3 rounded-lg bg-white border border-emerald-200 focus:ring-2 focus:ring-emerald-300"
        />

        {totalArchived > 0 &&
          pinnedArchived.length === 0 &&
          otherArchived.length === 0 &&
          <NoSearchMatch />}

        {/* PINNED */}
        {pinnedArchived.length > 0 && (
          <>
            <p className="text-sm font-semibold text-emerald-700 mb-2">PINNED</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {pinnedArchived.map((n) => (
                <div
                  key={n._id}
                  onClick={() => openNote(n)}
                  className="relative rounded-xl p-5 border shadow-sm hover:shadow-md transition cursor-pointer"
                  style={{ backgroundColor: n.color || "#FFFFFF" }}
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

                  <p className="text-sm text-gray-700 line-clamp-3">
                    {highlight(n.content || "", search)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* OTHER ARCHIVED */}
        {otherArchived.length > 0 && (
          <>
            <p className="text-sm font-semibold text-emerald-700 mb-2">ARCHIVED</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherArchived.map((n) => (
                <div
                  key={n._id}
                  onClick={() => openNote(n)}
                  className="relative rounded-xl p-5 border shadow-sm hover:shadow-md transition cursor-pointer"
                  style={{ backgroundColor: n.color || "#FFFFFF" }}
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

                  <p className="text-sm text-gray-700 line-clamp-3">
                    {highlight(n.content || "", search)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MODAL */}
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
            style={{ backgroundColor: selectedNote.color || "#FFFFFF" }}
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

            <div className="flex gap-5 mb-2 mt-2">
              {["#FFFFFF","#FEF3C7","#FFEDD5","#DCFCE7","#E0F2FE","#FCE7F3"].map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedNote(n => ({ ...n, color: c }))}
                  className="w-5 h-5 rounded-full border hover:scale-110 transition"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

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

export default ArchivedNotes;
