// 👉 NotesDashboard.jsx
// Label search + highlight added — no features removed or broken

import { useEffect, useMemo, useState, useRef } from "react";

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



  
  // ⭐ Label state
  const [modalLabels, setModalLabels] = useState([]);
  const [labelInput, setLabelInput] = useState("");

  // ⭐ Label editor popup
  const [showLabelEditor, setShowLabelEditor] = useState(false);

  // ⭐ Undo / Redo stacks (modal only)
const undoStack = useRef([]);
const redoStack = useRef([]);
const typingTimer = useRef(null);


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

  // 🔍 highlight helper (already existed — reused for labels)
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

  // ⭐ SEARCH NOW ALSO MATCHES LABELS (added safely)
  const { pinnedNotes, otherNotes } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const visible = notes.filter((n) => !n.isArchived);

    const filtered = q
      ? visible.filter((n) => {
          const inTitle = n.title?.toLowerCase().includes(q);
          const inContent = n.content?.toLowerCase().includes(q);
          const inLabels = n.labels?.some((lbl) =>
            lbl.toLowerCase().includes(q)
          );
          return inTitle || inContent || inLabels;
        })
      : visible;

    return {
      pinnedNotes: filtered.filter((n) => n.isPinned),
      otherNotes: filtered.filter((n) => !n.isPinned),
    };
  }, [notes, search]);

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
        color: note.color ?? "#FFFFFF",
        labels: note.labels ?? [],
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
        color: selectedNote.color ?? "#FFFFFF",
        labels: modalLabels ?? [],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((prev) =>
      prev.map((n) => (n._id === res.data._id ? res.data : n))
    );

    setSelectedNote(null);
    setMenuOpen(false);
  };

  const openNote = (note) => {
    const c = note.color || "#FFFFFF";

    setSelectedNote({
      ...note,
      color: c,
      colorBeforeEdit: c,
    });

    setModalTitle(note.title || "");
    setModalContent(note.content || "");

    // reset undo/redo for new note
undoStack.current = [];
    redoStack.current = [];
    
    undoStack.current.push({
  title: note.title || "",
  content: note.content || "",
});



    setModalLabels(note.labels || []);
    setLabelInput("");

    setMenuOpen(false);
    setShowLabelEditor(false);
  };

  const handleClose = async (clickedOutside = false) => {
    if (isClosing) return;
    setIsClosing(true);

    await closeModal(clickedOutside);

    setTimeout(() => {
      setIsClosing(false);
      setMenuOpen(false);
      setShowLabelEditor(false);
    }, 180);
  };

  // ⭐ Undo / Redo helpers (modal only)
const pushToUndo = () => {
  if (typingTimer.current) clearTimeout(typingTimer.current);

  typingTimer.current = setTimeout(() => {
    const last = undoStack.current[undoStack.current.length - 1];

    if (!last || last.title !== modalTitle || last.content !== modalContent) {
      undoStack.current.push({
        title: modalTitle,
        content: modalContent,
      });
      redoStack.current = [];
    }
  }, 500); // 500ms pause = 1 undo step
};

const handleUndo = () => {
  if (undoStack.current.length <= 1) return;

  const current = undoStack.current.pop();
  redoStack.current.push(current);

  const prev = undoStack.current[undoStack.current.length - 1];
  setModalTitle(prev.title);
  setModalContent(prev.content);
};


const handleRedo = () => {
  if (redoStack.current.length === 0) return;

  const next = redoStack.current.pop();
  undoStack.current.push(next);

  setModalTitle(next.title);
  setModalContent(next.content);
};



  const closeModal = async (clickedOutside = false) => {
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
      color === prevColor &&
      JSON.stringify(modalLabels) === JSON.stringify(selectedNote.labels || [])
    ) {
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
        { title, content, color, labels: modalLabels },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes((prev) =>
        prev.map((n) => (n._id === res.data._id ? res.data : n))
      );

      return setSelectedNote(null);
    }

    const res = await axios.post(
      "http://localhost:5000/api/notes",
      { title, content, color, labels: modalLabels },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes((prev) => [res.data, ...prev]);
    setSelectedNote(null);
  };

  const deleteNote = async () => {
    if (!selectedNote?._id) return;

    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:5000/api/notes/${selectedNote._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setNotes((prev) => prev.filter((n) => n._id !== selectedNote._id));
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

  const NoteCard = (note) => (
    <div
      onClick={() => openNote(note)}
      className="
        relative rounded-xl p-5
        border border-emerald-100
        hover:border-emerald-300
        shadow-sm hover:shadow-md
        transition-all duration-200 cursor-pointer
      "
      style={{ backgroundColor: note.color || "#FFFFFF" }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePin(note);
        }}
        className="absolute top-3 right-3 scale-95 hover:scale-130 transition"
      >
        <PinIcon active={note.isPinned} />
      </button>

      <h3 className="font-semibold mb-2 truncate text-gray-800">
        {highlight(note.title || "Untitled", search)}
      </h3>

      <p className="text-sm text-gray-600 line-clamp-4">
        {highlight(note.content || "", search)}
      </p>

      {/* ⭐ LABELS NOW HIGHLIGHT SEARCH TERMS */}
      {note.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {note.labels.map((lbl, i) => (
            <span
              key={i}
              className="text-xs px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full"
            >
              {highlight(lbl, search)}
            </span>
          ))}
        </div>
      )}
    </div>
  );

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

        {notes.filter((n) => !n.isArchived).length === 0 && <EmptyNotes />}

        {notes.length > 0 &&
          pinnedNotes.length === 0 &&
          otherNotes.length === 0 && <NoSearchMatch />}

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

        {otherNotes.length > 0 && (
          <>
            <p className="text-sm font-semibold text-emerald-700 mb-2">Notes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {otherNotes.map((n) => (
                <NoteCard key={n._id} {...n} />
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => openNote({ _id: null, color: "#FFFFFF", labels: [] })}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition"
      >
        +
      </button>

      {selectedNote && (
        <div
          onMouseDown={() => handleClose(true)}
          className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${
            isClosing ? "opacity-0 transition" : ""
          }`}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className={`w-[90%] max-w-2xl rounded-xl p-6 shadow-xl ${
              isClosing ? "scale-95" : "scale-100"
            } transition-all duration-200`}
            style={{ backgroundColor: selectedNote.color || "#FFFFFF" }}
          >
            <div className="flex justify-between items-center mb-3">
              <input
                value={modalTitle}
                onChange={(e) => {
  pushToUndo();
  setModalTitle(e.target.value);
}}

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
              onChange={(e) => {
  pushToUndo();
  setModalContent(e.target.value);
}}

              placeholder="Take a note..."
              className="w-full min-h-[220px] outline-none resize-none"
            />

            {/* ⭐ MODAL LABELS ALSO HIGHLIGHT SEARCH TERMS */}
            {modalLabels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 mb-2">
                {modalLabels.map((lbl, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-xs rounded-full 
                               bg-emerald-50 border border-emerald-200 
                               text-emerald-700 flex items-center gap-1"
                  >
                    {highlight(lbl, search)}
                    <button
                      onClick={() =>
                        setModalLabels((prev) =>
                          prev.filter((l) => l !== lbl)
                        )
                      }
                      className="text-emerald-600 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* ⭐ COLORS + ⋮ MENU — aligned in same row */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-5 mb-2 mt-2">
                {[
                  "#FFFFFF",
                  "#FEF3C7",
                  "#FFEDD5",
                  "#DCFCE7",
                  "#E0F2FE",
                  "#FCE7F3",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedNote((n) => ({ ...n, color: c }))}
                    className="w-5 h-5 rounded-full border hover:scale-110 transition"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {/* 🎯 ⋮ MENU */}
              <div className="flex items-center gap-3 relative">

  {/* Undo */}
  <button
    onClick={handleUndo}
    className="px-2 py-1 text-xl rounded transition-transform duration-150 hover:scale-155"
    title="Undo"
  >
    ⟲
  </button>

  {/* Redo */}
  <button
    onClick={handleRedo}
    className="px-2 py-1 text-xl rounded transition-transform duration-150 hover:scale-155"
    title="Redo"
  >
    ⟳
  </button>

                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="px-3 py-1 border rounded"
                >
                  ⋮
                </button>

                {menuOpen && (
                  <div className="absolute bottom-12 right-0 bg-white border rounded shadow px-3 py-2 w-28">
                    <button
                      onClick={() => {
                        setShowLabelEditor(true);
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left mb-1"
                    >
                      Edit Labels
                    </button>

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

                {/* ⭐ LABEL POPUP */}
                {showLabelEditor && (
                  <div className="absolute bottom-16 right-0 bg-white/80 backdrop-blur-md
                                border border-emerald-200 rounded-xl shadow-lg p-3 w-64">
                    <p className="text-sm font-medium text-emerald-700 mb-2">
                      Edit Labels
                    </p>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {modalLabels.map((lbl, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs rounded-full
                                   bg-emerald-50/80 border border-emerald-200
                                   text-emerald-700 flex items-center gap-1"
                        >
                          {lbl}
                          <button
                            onClick={() =>
                              setModalLabels((prev) =>
                                prev.filter((l) => l !== lbl)
                              )
                            }
                            className="text-emerald-600 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        value={labelInput}
                        onChange={(e) => setLabelInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const v = labelInput.trim();
                            if (v && !modalLabels.includes(v)) {
                              setModalLabels((prev) => [...prev, v]);
                            }
                            setLabelInput("");
                            setShowLabelEditor(false);
                          }
                        }}
                        placeholder="Add label"
                        className="flex-1 px-2 py-1 text-xs rounded-lg
                                 border border-emerald-300 bg-white/70"
                      />

                      <button
                        onClick={() => {
                          const v = labelInput.trim();
                          if (v && !modalLabels.includes(v)) {
                            setModalLabels((prev) => [...prev, v]);
                          }
                          setLabelInput("");
                          setShowLabelEditor(false);
                        }}
                        className="px-2 py-1 text-xs rounded-lg
                                 bg-emerald-600/80 text-white hover:bg-emerald-600"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesDashboard;
