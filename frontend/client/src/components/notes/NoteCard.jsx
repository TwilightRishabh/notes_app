function PinIcon({ active }) {
  return (
    <svg className="cursor-pointer" width="20" height="20" viewBox="0 0 24 24">
      <path
        fill={active ? "#059669" : "none"}
        stroke="#059669"
        strokeWidth="1.6"
        d="M12 2l4 4-2 2 3 7-2 2-7-3-2 2-4-4 2-2-3-7 2-2 7 3z"
      />
    </svg>
  );
}

function NoteCard({
  note,
  search,
  selectedIds,
  selectionMode,
  toggleSelect,
  togglePin,
  openNote,
  highlight,
}) {
  return (
    <div
      onClick={() => {
        if (selectionMode) return;
        openNote(note); // ✅ MUST pass full note object
      }}
      className={`
        note-card group relative rounded-xl p-5
        border
        ${
          selectedIds.has(note._id)
            ? "border-emerald-600 ring-2 ring-emerald-300"
            : "border-emerald-100 hover:border-emerald-300"
        }
        shadow-sm hover:shadow-md
        transition-all duration-200 cursor-pointer
      `}
      style={{ backgroundColor: note.color || "#FFFFFF" }}
    >
      {/* Select circle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleSelect(note._id);
        }}
        className={`
          absolute top-3 left-3 w-6 h-6 rounded-full 
          border border-emerald-600 bg-white
          flex items-center justify-center text-sm
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          ${selectedIds.has(note._id) ? "opacity-100" : ""}
        `}
      >
        {selectedIds.has(note._id) && "✔"}
      </button>

      {/* Pin */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePin(note);
        }}
        className="absolute top-3 right-3 scale-95 hover:scale-125 transition"
      >
        <PinIcon active={note.isPinned} />
      </button>

      <h3 className="font-semibold mb-2 truncate text-gray-800 mt-4">
        {highlight(note.title || "Untitled", search)}
      </h3>

      <p className="text-sm text-gray-600 line-clamp-4">
        {highlight(note.content || "", search)}
      </p>

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
}

export default NoteCard;
