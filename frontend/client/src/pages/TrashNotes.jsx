// ⭐ UPDATED TrashNotes — preserves & displays note color

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function TrashNotes() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  /* ---------- FETCH TRASH NOTES ---------- */
  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await axios.get(
        "http://localhost:5000/api/notes?onlyDeleted=true",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(res.data);
    } catch {
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  /* ---------- AUTO-DELETE AFTER 30 DAYS ---------- */
  const daysLeftToDelete = (deletedAt) => {
    if (!deletedAt) return 30;

    const deletedDate = new Date(deletedAt);
    const now = new Date();
    const diffMs = 30 * 24 * 60 * 60 * 1000 - (now - deletedDate);
    const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    return days < 0 ? 0 : days;
  };

  useEffect(() => {
    const expired = notes.filter(n => daysLeftToDelete(n.deletedAt) === 0);

    expired.forEach(async (note) => {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/notes/${note._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    });

    if (expired.length > 0) {
      setNotes(prev => prev.filter(n => daysLeftToDelete(n.deletedAt) > 0));
    }
  }, [notes]);

  /* ---------- SEARCH ---------- */
  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();

    return q
      ? notes.filter(
          n =>
            n.title?.toLowerCase().includes(q) ||
            n.content?.toLowerCase().includes(q)
        )
      : notes;
  }, [notes, search]);

  /* ---------- RESTORE (⭐ keep color, pin, archive flags) ---------- */
  const restoreNote = async (note) => {
    const token = localStorage.getItem("token");

    const res = await axios.put(
      `http://localhost:5000/api/notes/${note._id}`,
      {
        ...note,
        isDeleted: false,
        color: note.color ?? "#FFFFFF"
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes(prev => prev.filter(n => n._id !== res.data._id));
  };

  /* ---------- DELETE FOREVER ---------- */
  const deleteForever = async (note) => {
    const token = localStorage.getItem("token");

    await axios.delete(
      `http://localhost:5000/api/notes/${note._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setNotes(prev => prev.filter(n => n._id !== note._id));
  };

  /* ---------- EMPTY TRASH ---------- */
  const emptyTrash = async () => {
    if (!window.confirm("Delete all notes permanently? This cannot be undone."))
      return;

    const token = localStorage.getItem("token");

    await Promise.all(
      notes.map(n =>
        axios.delete(
          `http://localhost:5000/api/notes/${n._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      )
    );

    setNotes([]);
  };

  const EmptyTrash = () => (
    <div className="flex flex-col items-center justify-center h-[55vh] text-gray-600">
      <svg width="65" height="65" viewBox="0 0 24 24" className="mb-3">
        <path fill="#6b7280" d="M6 19V7h12v12H6zm2-2h8V9H8v8zM9 4h6v2H9V4z"/>
      </svg>
      <p className="font-medium">Trash is empty</p>
      <p className="text-sm opacity-70">Deleted notes appear here</p>
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
      <div className="max-w-6xl mx-auto">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search deleted notes..."
          className="w-full mb-8 px-4 py-3 rounded-lg bg-white border border-emerald-200 focus:ring-2 focus:ring-emerald-300"
        />

        {notes.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={emptyTrash}
              className="px-4 py-2 border rounded text-red-600"
            >
              Empty Trash
            </button>
          </div>
        )}

        {filteredNotes.length === 0 && <EmptyTrash />}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredNotes.map(n => (
            <div
              key={n._id}
              className="
                relative rounded-xl p-5
                border border-emerald-100
                shadow-sm
              "
              style={{ backgroundColor: n.color || "#FFFFFF" }}  // ⭐ show color
            >
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
                  onClick={() => restoreNote(n)}
                  className="px-3 py-1 border rounded"
                >
                  Restore
                </button>

                <button
                  onClick={() => deleteForever(n)}
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
