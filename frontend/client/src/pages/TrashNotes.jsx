// ⭐ UPDATED TrashNotes — preserves & displays note color

import { useEffect, useMemo, useState } from "react";



import useNotesEngine from "../hooks/useNotesEngine";
import useBulkSelection from "../hooks/useBulkSelection";
import BulkActionBar from "../components/notes/BulkActionBar";

function TrashNotes() {
  const [search, setSearch] = useState("");

  const {
  trashedNotes,
  isLoading,
  restoreNote,
  deleteForever,
  bulkRestore,
  bulkDeleteForever,
  emptyTrash,
} = useNotesEngine();


  const safeTrashedNotes = trashedNotes || [];




  const {
    selectedIds,
    selectionMode,
    toggleSelect,
    clearSelection,
    selectAll,
  } = useBulkSelection(safeTrashedNotes);

  // ⭐ Deselect when clicking outside notes (Google Keep behavior)
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

  /* ---------- AUTO-DELETE AFTER 30 DAYS ---------- */
  const daysLeftToDelete = (deletedAt) => {
    if (!deletedAt) return 30;

    const deletedDate = new Date(deletedAt);
    const now = new Date();
    const diffMs = 30 * 24 * 60 * 60 * 1000 - (now - deletedDate);
    const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    return days < 0 ? 0 : days;
  };

  /* ---------- SEARCH ---------- */
  const filteredNotes = useMemo(() => {
  const q = search.trim().toLowerCase();

  return q
    ? safeTrashedNotes.filter(
        (n) =>
          n.title?.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q)
      )
    : safeTrashedNotes;
}, [safeTrashedNotes, search]);


  /* ---------- RESTORE (⭐ keep color, pin, archive flags) ---------- */

 const EmptyTrash = () => (
  <div className="flex flex-col items-center justify-center h-[55vh] text-gray-600">
    {/* Trash Icon */}
    <svg
      width="90"
      height="90"
      viewBox="0 0 24 24"
      fill="none"
      className="mb-4"
    >
      <path
        d="M3 6h18"
        stroke="#6b7280"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6v-2a2 2 0 012-2h4a2 2 0 012 2v2"
        stroke="#6b7280"
        strokeWidth="2"
      />
      <rect
        x="6"
        y="6"
        width="12"
        height="14"
        rx="2"
        stroke="#6b7280"
        strokeWidth="2"
      />
      <path
        d="M10 11v5M14 11v5"
        stroke="#6b7280"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>

    <p className="font-semibold text-lg">Trash is empty</p>
    <p className="text-sm opacity-70 mt-1">
      Deleted notes appear here
    </p>
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
      {/* ⭐ Bulk Action Bar */}
     {selectionMode && (
  <BulkActionBar
  selectedCount={selectedIds.size}
  totalCount={safeTrashedNotes.length}
  onClear={clearSelection}
  onSelectAll={selectAll}
  onDelete={() => bulkDeleteForever([...selectedIds])}
  onRestore={() => bulkRestore([...selectedIds])}
/>
)}

      <div className="max-w-6xl mx-auto">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search deleted notes..."
          className="w-full mb-8 px-4 py-3 rounded-lg bg-white border border-emerald-200 focus:ring-2 focus:ring-emerald-300"
        />

        {safeTrashedNotes.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={emptyTrash}
              className="px-4 py-2 border rounded text-red-600"
            >
              Empty Trash
            </button>
          </div>
        )}

        {safeTrashedNotes.length === 0 && <EmptyTrash />}

{safeTrashedNotes.length > 0 && filteredNotes.length === 0 && (
  <p className="text-center text-gray-500 mt-10">
    No deleted notes match your search.
  </p>
)}


        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredNotes.map((n) => (
            <div
              key={n._id}
              onClick={() => {
                if (selectionMode) return;
              }}
              className={`
      note-card group relative rounded-xl p-5
      border
      ${
        selectedIds.has(n._id)
          ? "border-emerald-600 ring-2 ring-emerald-300"
          : "border-emerald-100 hover:border-emerald-300"
      }
      shadow-sm transition cursor-pointer
    `}
              style={{ backgroundColor: n.color || "#FFFFFF" }}
            >
              {/* Hover circle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(n._id);
                }}
                className={`
    absolute top-3 left-3 w-6 h-6 rounded-full 
    border border-emerald-600 bg-white
    flex items-center justify-center text-sm
    opacity-0 group-hover:opacity-100
    transition-opacity duration-200
    ${selectedIds.has(n._id) ? "opacity-100" : ""}
  `}
              >
                {selectedIds.has(n._id) && "✔"}
              </button>

              <h3 className="font-semibold mb-1 truncate">
                {n.title || "Untitled"}
              </h3>

              <p className="text-sm text-gray-700 line-clamp-3 mb-2">
                {n.content}
              </p>

              <p className="text-xs text-red-500">
                Auto-deletes in {daysLeftToDelete(n.deletedAt)} days
              </p>

              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={() => restoreNote(n._id)}
                  className="px-3 py-1 border rounded"
                >
                  Restore
                </button>

                <button
                  onClick={() => deleteForever(n._id)}
                  className="px-3 py-1 border rounded text-red-600"
                >
                  Delete Forever
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrashNotes;
