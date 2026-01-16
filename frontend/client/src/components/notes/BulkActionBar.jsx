export default function BulkActionBar({
  selectedCount,
  totalCount,
  onClear,
  onSelectAll,
  onDelete,
}) {
  return (
    <div className="bulk-bar fixed top-16 left-0 right-0 h-14 bg-white shadow-md flex items-center px-6 z-50">
      {/* Cancel */}
      <button onClick={onClear} className="text-xl">
        ❌
      </button>

      {/* Selected count */}
      <span className="ml-4 font-medium text-gray-700">
        {selectedCount} selected
      </span>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Select all */}
        {selectedCount !== totalCount && (
          <button
            onClick={onSelectAll}
            className="px-3 py-1 border rounded"
          >
            Select All
          </button>
        )}

        {/* Deselect all */}
        {selectedCount === totalCount && (
          <button
            onClick={onClear}
            className="px-3 py-1 border rounded"
          >
            Deselect All
          </button>
        )}

        {/* Delete */}
        <button
          onClick={onDelete}
          className="px-3 py-1 border rounded text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
