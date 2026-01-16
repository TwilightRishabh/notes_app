import NoteCard from "./NoteCard";

export default function NotesSection({
  title,
  notes,
  search,
  selectedIds,
  selectionMode,
  toggleSelect,
  togglePin,
  openNote,
  highlight,
}) {
  if (!notes.length) return null;

  return (
    <>
      {title && (
        <p className="text-sm font-semibold text-emerald-700 mb-2">
          {title}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {notes.map((n) => (
          <NoteCard
            key={n._id}
            note={n}
            search={search}
            selectedIds={selectedIds}
            selectionMode={selectionMode}
            toggleSelect={toggleSelect}
            togglePin={togglePin}
            openNote={openNote}
            highlight={highlight}
          />
        ))}
      </div>
    </>
  );
}
