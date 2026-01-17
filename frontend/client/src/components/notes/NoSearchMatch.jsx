export default function NoSearchMatch() {
  return (
    <div className="flex flex-col items-center justify-center h-[45vh] text-gray-600">
      {/* Search Icon */}
      <svg
        width="90"
        height="90"
        viewBox="0 0 24 24"
        fill="none"
        className="mb-4"
      >
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke="#6b7280"
          strokeWidth="2"
        />
        <line
          x1="16.5"
          y1="16.5"
          x2="21"
          y2="21"
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="11"
          x2="14"
          y2="11"
          stroke="#6b7280"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <p className="font-semibold text-lg">No matching notes found</p>
      <p className="text-sm opacity-70 mt-1">
        Try searching with different keywords
      </p>
    </div>
  );
}
