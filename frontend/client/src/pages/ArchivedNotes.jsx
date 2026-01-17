// ⭐ ArchivedNotes — label search + highlight + label editing
//    (no features removed / behavior preserved)
import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import useNotesEngine from "../hooks/useNotesEngine";
import useBulkSelection from "../hooks/useBulkSelection";
import useNoteModal from "../hooks/useNoteModal";


import NotesSearchBar from "../components/notes/NotesSearchBar";
import NotesSection from "../components/notes/NotesSection";

import BulkActionBar from "../components/notes/BulkActionBar";

import NoteModal from "../components/notes/NoteModal";



function ArchivedNotes() {
  const navigate = useNavigate();
  const { notes, isLoading, updateExistingNote, removeNote, bulkRemove } =
    useNotesEngine(navigate);

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
  if (!selectedNote?._id) return;   // archive page never creates notes

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
      isArchived: false,
      labels,
    });
  },
});

  



 

  /* ---------- ⭐ highlight helper (labels included) ---------- */
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

  /* ---------- ⭐ SEARCH also matches labels ---------- */
  const { pinnedArchived, otherArchived, totalArchived } = useMemo(() => {
    const q = search.trim().toLowerCase();
    const archived = (notes || []).filter((n) => n.isArchived);

    const filtered = q
      ? archived.filter((n) => {
          const inTitle = n.title?.toLowerCase().includes(q);
          const inContent = n.content?.toLowerCase().includes(q);

          // ⭐ search matches label too
          const inLabels = n.labels?.some((lbl) =>
            lbl.toLowerCase().includes(q)
          );

          return inTitle || inContent || inLabels;
        })
      : archived;

    return {
      pinnedArchived: filtered.filter((n) => n.isPinned),
      otherArchived: filtered.filter((n) => !n.isPinned),
      totalArchived: archived.length,
    };
  }, [notes, search]);






  if (!notes) return null;
const archivedNotes = notes.filter((n) => n.isArchived);


  const {
    selectedIds,
    selectionMode,
    toggleSelect,
    clearSelection,
    selectAll,
  } = useBulkSelection(archivedNotes);

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

    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, [selectionMode]);

  // ---------------- TEMP SAFE FUNCTIONS (Phase 1) ----------------
  // Only to prevent crash. Real logic comes in Phase 2.

 const bulkDelete = async () => {
  await bulkRemove([...selectedIds]);
  clearSelection();
};

  const togglePin = async (note) => {
    if (!note?._id) return;

    await updateExistingNote(note._id, {
      ...note,
      isPinned: !note.isPinned,
      isArchived: true,
    });

    
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

  /* ---------- UI ---------- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <p className="text-emerald-700">Loading…</p>
      </div>
    );
  }

  const NoSearchMatch = () => (
    <div className="flex flex-col items-center justify-center h-[40vh] text-gray-600">
      
      <svg width="72" height="72" viewBox="0 0 24 24" className="mb-3">
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
        <path d="M3 10h18" fill="none" stroke="#6b7280" strokeWidth="2" />
        <path
          d="M12 11v4 m-3-2 3 3 3-3"
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

    const EmptyArchived = () => (
    <div className="flex flex-col items-center justify-center h-[55vh] text-gray-600">
      <svg width="72" height="72" viewBox="0 0 24 24" className="mb-3">
        <path
          d="M4 4h16v4H4V4zm0 6h16v10H4V10z"
          fill="none"
          stroke="#6b7280"
          strokeWidth="2"
        />
        <path
          d="M8 14h8"
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <p className="font-medium text-lg">No Archived Notes Yet</p>
      <p className="text-sm opacity-70">
        Archive notes to keep them for later
      </p>
    </div>
  );


  return (
    <div className="min-h-screen bg-emerald-50 px-6 py-8">
      {/* ⭐ Bulk Action Bar */}
      {selectionMode && (
  <BulkActionBar
    selectedCount={selectedIds.size}
    totalCount={archivedNotes.length}
    onClear={clearSelection}
    onSelectAll={selectAll}
    onDelete={bulkDelete}
  />
)}


      <div className="max-w-6xl mx-auto">
        <NotesSearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search archived notes..."
        />

        {totalArchived === 0 && <EmptyArchived />}

        {/* Search but no match */}
        {totalArchived > 0 &&
          pinnedArchived.length === 0 &&
          otherArchived.length === 0 && <NoSearchMatch />}
        {/* ---------- PINNED ---------- */}
        <NotesSection
  title="PINNED"
  notes={pinnedArchived}
  search={search}
  selectedIds={selectedIds}
  selectionMode={selectionMode}
  toggleSelect={toggleSelect}
  togglePin={togglePin}
  openNote={openNote}
  highlight={highlight}
/>


        {/* ---------- OTHER ARCHIVED ---------- */}
        <NotesSection
  title="ARCHIVED"
  notes={otherArchived}
  search={search}
  selectedIds={selectedIds}
  selectionMode={selectionMode}
  toggleSelect={toggleSelect}
  togglePin={togglePin}
  openNote={openNote}
  highlight={highlight}
/>

      </div>

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

export default ArchivedNotes;
