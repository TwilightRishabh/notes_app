// 👉 NotesDashboard.jsx
// Label search + highlight added — no features removed or broken

import { useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";

// hooks
import useBulkSelection from "../hooks/useBulkSelection";
import useNotesEngine from "../hooks/useNotesEngine";
import useNoteModal from "../hooks/useNoteModal";


// components
import BulkActionBar from "../components/notes/BulkActionBar";
import NoteModal from "../components/notes/NoteModal";
import NotesSearchBar from "../components/notes/NotesSearchBar";
import EmptyNotes from "../components/notes/EmptyNotes";
import NoSearchMatch from "../components/notes/NoSearchMatch";
import NotesSection from "../components/notes/NotesSection";


function NotesDashboard() {
  const navigate = useNavigate();

  // ✅ Notes engine (single source of truth)
  const {
    notes,
    activeNotes,
    isLoading,
    addNote,
    updateExistingNote,
    removeNote,
    bulkRemove,
  } = useNotesEngine(navigate);

  const [search, setSearch] = useState("");


  const {
  selectedNote,
  setSelectedNote,
  modalTitle,
  modalContent,
  modalLabels,
  labelInput,
  menuOpen,
  showLabelEditor,
  isClosing,

  setModalTitle,
  setModalContent,
  setModalLabels,
  setLabelInput,
  setMenuOpen,
  setShowLabelEditor,

  openNote,
  handleTyping,
  handleUndo,
  handleRedo,
  handleClose,
  deleteCurrentNote,
  toggleArchive,
} = useNoteModal({
  onSave: async ({ selectedNote, title, content, labels }) => {
    if (!selectedNote?._id) {
      await addNote({
  title,
  content,
  labels,
  color: selectedNote?.color || "#FFFFFF",
});
      return;
    }

    if (!title && !content) {
      await removeNote(selectedNote._id);
      return;
    }

    await updateExistingNote(selectedNote._id, {
      ...selectedNote,
      title,
      content,
      labels,
    });
  },

  onDelete: async (note) => {
    await removeNote(note._id);
  },

  onToggleArchive: async (note, labels) => {
    await updateExistingNote(note._id, {
      ...note,
      isArchived: !note.isArchived,
      labels,
    });
  },
});






  // ⭐ Bulk selection
  const {
    selectedIds,
    selectionMode,
    toggleSelect,
    clearSelection,
    selectAll,
  } = useBulkSelection(activeNotes);

  // Lock scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selectedNote ? "hidden" : "auto";
  }, [selectedNote]);

  // Outside click deselect
  useEffect(() => {
    if (!selectionMode) return;

    const handleOutsideMouseDown = (e) => {
      const clickedNote = e.target.closest(".note-card");
      const clickedBar = e.target.closest(".bulk-bar");

      if (!clickedNote && !clickedBar) {
        clearSelection();
      }
    };

    document.addEventListener("mousedown", handleOutsideMouseDown);
    return () => document.removeEventListener("mousedown", handleOutsideMouseDown);
  }, [selectionMode]);

  // ESC close modal
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape" && selectedNote) handleClose(true);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [selectedNote, modalTitle, modalContent]);

  // 🔍 highlight helper
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

  // ⭐ SEARCH (title + content + labels)
  const { pinnedNotes, otherNotes } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const visible = notes.filter((n) => !n.isArchived && !n.isDeleted);

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

  // ⭐ Bulk delete
  const bulkDelete = async () => {
  await bulkRemove([...selectedIds]);
  clearSelection();
};

  // ⭐ Toggle pin
  const togglePin = async (note) => {
    if (!note?._id) return;

    await updateExistingNote(note._id, {
      title: note.title ?? "",
      content: note.content ?? "",
      isPinned: !Boolean(note.isPinned),
      isArchived: note.isArchived ?? false,
      color: note.color ?? "#FFFFFF",
      labels: note.labels ?? [],
    });
  };

 
 

  

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-emerald-700">Loading notes…</p>
      </div>
    );
  }

  const totalNotes = activeNotes.length;
  const visibleCount = pinnedNotes.length + otherNotes.length;

  return (
    <div className="min-h-screen bg-emerald-50 px-6 py-8">
      {selectionMode && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalCount={activeNotes.length}
          onClear={clearSelection}
          onSelectAll={selectAll}
          onDelete={bulkDelete}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <NotesSearchBar value={search} onChange={setSearch} />

        {totalNotes === 0 && <EmptyNotes />}
        {totalNotes > 0 && visibleCount === 0 && <NoSearchMatch />}

        <NotesSection
          title="PINNED"
          notes={pinnedNotes}
          search={search}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          toggleSelect={toggleSelect}
          togglePin={togglePin}
          openNote={openNote}
          highlight={highlight}
        />

        <NotesSection
          title="Notes"
          notes={otherNotes}
          search={search}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          toggleSelect={toggleSelect}
          togglePin={togglePin}
          openNote={openNote}
          highlight={highlight}
        />
      </div>

      <button
        onClick={() => openNote({ color: "#FFFFFF", labels: [] })}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 active:scale-95 transition"
      >
        +
      </button>

      <NoteModal
        selectedNote={selectedNote}
        setSelectedNote={setSelectedNote}
        isClosing={isClosing}
        modalTitle={modalTitle}
        modalContent={modalContent}
        setModalTitle={setModalTitle}
        setModalContent={setModalContent}
        modalLabels={modalLabels}
        setModalLabels={setModalLabels}
        labelInput={labelInput}
        setLabelInput={setLabelInput}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        showLabelEditor={showLabelEditor}
        setShowLabelEditor={setShowLabelEditor}
        handleClose={handleClose}
        toggleArchive={toggleArchive}
        deleteCurrentNote={deleteCurrentNote}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        pushToUndo={handleTyping}
        highlight={(text) => highlight(text, search)}
      />
    </div>
  );
}

export default NotesDashboard;
