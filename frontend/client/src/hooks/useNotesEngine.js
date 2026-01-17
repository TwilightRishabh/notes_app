import { useEffect, useState, useMemo } from "react";
import { useNotesApi } from "./useNotesApi";

export default function useNotesEngine(navigate) {
  const { getNotes, getTrashedNotes, createNote, updateNote, deleteNote } = useNotesApi();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [trashedNotes, setTrashedNotes] = useState([]);


  // Load notes
  // Load notes + trash
const fetchNotes = async () => {
  try {
    const [notesRes, trashRes] = await Promise.all([
      getNotes(),
      getTrashedNotes(),
    ]);

    setNotes(notesRes.data);
    setTrashedNotes(trashRes.data);
  } catch {
    navigate && navigate("/login");
  } finally {
    setIsLoading(false);
  }
};


  useEffect(() => {
    fetchNotes();
  }, []);

  // Active notes
 // Active notes
const activeNotes = useMemo(
  () => notes.filter((n) => !n.isArchived && !n.isDeleted),
  [notes]
);

// Archived notes
const archivedNotes = useMemo(
  () => notes.filter((n) => n.isArchived && !n.isDeleted),
  [notes]
);



  // CRUD helpers
 const addNote = async (data) => {
  const res = await createNote({
    title: data.title ?? "",
    content: data.content ?? "",
    color: data.color ?? "#FFFFFF",
    labels: data.labels ?? [],
    isPinned: false,
    isArchived: false,
    isDeleted: false,
  });

  setNotes((prev) => [res.data, ...prev]);
};

  const updateExistingNote = async (id, data) => {
    const res = await updateNote(id, data);
    setNotes((prev) =>
      prev.map((n) => (n._id === res.data._id ? res.data : n))
    );
    return res.data;
  };


// Soft delete → move to trash
const removeNote = async (id) => {
  const res = await deleteNote(id);

  if (res.data?.note) {
    // remove from active list
    setNotes((prev) => prev.filter((n) => n._id !== id));

    // add to trash
    setTrashedNotes((prev) => [res.data.note, ...prev]);
  }
};





  // Restore from trash
const restoreNote = async (id) => {
  const res = await updateNote(id, { isDeleted: false, deletedAt: null });

  // remove from trash
  setTrashedNotes((prev) => prev.filter((n) => n._id !== id));

  // add back to notes
  setNotes((prev) => [res.data, ...prev]);
};


  
  
const bulkRestore = async (ids) => {
  const results = await Promise.all(
    ids.map((id) =>
      updateNote(id, { isDeleted: false, deletedAt: null })
    )
  );

  const restored = results.map((r) => r.data);

  setTrashedNotes((prev) => prev.filter((n) => !ids.includes(n._id)));
  setNotes((prev) => [...restored, ...prev]);
};



  // Delete forever (only for trash)
const deleteForever = async (id) => {
  await deleteNote(id);
  setTrashedNotes((prev) => prev.filter((n) => n._id !== id));
};



const bulkDeleteForever = async (ids) => {
  await Promise.all(ids.map((id) => deleteNote(id)));
  setTrashedNotes((prev) => prev.filter((n) => !ids.includes(n._id)));
};


  
  const emptyTrash = async () => {
  await Promise.all(trashedNotes.map((n) => deleteNote(n._id)));
  setTrashedNotes([]);
};




  // Bulk move to trash
  const bulkRemove = async (ids) => {
  console.log("Bulk removing:", ids);
  const results = await Promise.all(
    ids.map((id) => deleteNote(id))
  );

  setNotes((prev) =>
    prev.map((n) => {
      const res = results.find(r => r.data?.note?._id === n._id);
      return res ? res.data.note : n;
    })
  );
};






return {
  notes,
  activeNotes,
  archivedNotes,
  trashedNotes,

  isLoading,

  addNote,
  updateExistingNote,

  removeNote,        // move to trash
  restoreNote,       // restore from trash
  deleteForever,     // permanent delete

  bulkRemove,        // bulk move to trash
  bulkRestore,       // bulk restore
  bulkDeleteForever, // bulk permanent delete

  emptyTrash,        // clear trash
};


}
