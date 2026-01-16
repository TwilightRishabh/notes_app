export default function NotesSearchBar({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search notes..."
      className="w-full mb-8 px-4 py-3 rounded-lg bg-white border border-emerald-200 focus:ring-2 focus:ring-emerald-300"
    />
  );
}
