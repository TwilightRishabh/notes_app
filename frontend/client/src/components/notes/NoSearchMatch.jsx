export default function NoSearchMatch() {
  return (
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
}
