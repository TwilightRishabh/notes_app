import { useEffect, useState, useMemo } from "react";
import { useNotesApi } from "./useNotesApi";

export default function useNotesEngine(navigate) {
  const { getNotes, createNote, updateNote, deleteNote } = useNotesApi();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes
  const fetchNotes = async () => {
    try {
      const res = await getNotes();
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

  // Active notes
  const activeNotes = useMemo(
    () => notes.filter((n) => !n.isArchived),
    [notes]
  );

  // CRUD helpers
  const addNote = async (data) => {
    const res = await createNote(data);
    setNotes((prev) => [res.data, ...prev]);
  };

  const updateExistingNote = async (id, data) => {
    const res = await updateNote(id, data);
    setNotes((prev) =>
      prev.map((n) => (n._id === res.data._id ? res.data : n))
    );
    return res.data;
  };

  const removeNote = async (id) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const bulkRemove = async (ids) => {
    await Promise.all([...ids].map((id) => deleteNote(id)));
    setNotes((prev) => prev.filter((n) => !ids.has(n._id)));
  };

  return {
    notes,
    activeNotes,
    isLoading,
    addNote,
    updateExistingNote,
    removeNote,
    bulkRemove,
  };
}
