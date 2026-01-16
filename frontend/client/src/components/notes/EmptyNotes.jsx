export default function EmptyNotes() {
  return (
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
}
