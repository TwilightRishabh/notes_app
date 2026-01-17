import { useEffect, useRef, useState } from "react";



export default function useNoteModal({ onSave, onDelete, onToggleArchive }) {
  const [selectedNote, setSelectedNote] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [modalLabels, setModalLabels] = useState([]);
  const [labelInput, setLabelInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLabelEditor, setShowLabelEditor] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const typingTimer = useRef(null);
  const cleanupModal = () => {
  setSelectedNote(null);
  setModalTitle("");
  setModalContent("");
  setModalLabels([]);
  setLabelInput("");
  setMenuOpen(false);
  setShowLabelEditor(false);
  setIsClosing(false);
};
  const lastSnapshot = useRef({ title: "", content: "" });

  // Lock scroll
useEffect(() => {
  if (selectedNote) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [selectedNote]);

  // ESC close
  useEffect(() => {
    const key = (e) => {
      if (e.key === "Escape" && selectedNote) handleClose(true);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [selectedNote, modalTitle, modalContent, modalLabels]);

  const openNote = (note) => {
    const c = note.color || "#FFFFFF";

    setSelectedNote({ ...note, color: c, colorBeforeEdit: c });
    setModalTitle(note.title || "");
    setModalContent(note.content || "");
    setModalLabels(note.labels || []);
    setLabelInput("");
    setShowLabelEditor(false);
    setMenuOpen(false);

    undoStack.current = [];
    redoStack.current = [];
    lastSnapshot.current = {
      title: note.title || "",
      content: note.content || "",
    };
  };

  const pushHistorySnapshot = () => {
    const snap = { title: modalTitle, content: modalContent };

    if (
      snap.title === lastSnapshot.current.title &&
      snap.content === lastSnapshot.current.content
    )
      return;

    undoStack.current.push(lastSnapshot.current);
    lastSnapshot.current = snap;
    redoStack.current = [];
  };

  const handleUndo = () => {
    if (!undoStack.current.length) return;

    const prev = undoStack.current.pop();
    redoStack.current.push({ title: modalTitle, content: modalContent });

    setModalTitle(prev.title);
    setModalContent(prev.content);
    lastSnapshot.current = prev;
  };

  const handleRedo = () => {
    if (!redoStack.current.length) return;

    const next = redoStack.current.pop();
    undoStack.current.push({ title: modalTitle, content: modalContent });

    setModalTitle(next.title);
    setModalContent(next.content);
    lastSnapshot.current = next;
  };

  const handleTyping = (type, value) => {
    if (typingTimer.current) clearTimeout(typingTimer.current);

    if (type === "title") setModalTitle(value);
    if (type === "content") setModalContent(value);

    typingTimer.current = setTimeout(() => {
      pushHistorySnapshot();
    }, 700);
  };

const handleClose = async (withAnimation = false) => {
  if (isClosing) return;
  setIsClosing(true);

  try {
    await onSave({
      selectedNote,
      title: modalTitle,
      content: modalContent,
      labels: modalLabels,
    });
  } catch (err) {
    console.warn("Note save skipped:", err.message || err);
  }

  if (withAnimation) {
    setTimeout(() => {
      cleanupModal();
    }, 180);
  } else {
    cleanupModal();
  }
};



const deleteCurrentNote = async () => {
  if (!selectedNote?._id) return;
  await onDelete(selectedNote);
  cleanupModal();
};

const toggleArchive = async () => {
  if (!selectedNote?._id) return;
  await onToggleArchive(selectedNote, modalLabels);
  cleanupModal();
};


  
 return {
  selectedNote,
  setSelectedNote,
  modalTitle,
  modalContent,
  modalLabels,
  labelInput,
  menuOpen,
  showLabelEditor,
  isClosing,

  setModalTitle,
  setModalContent,
  setModalLabels,
  setLabelInput,
  setMenuOpen,
  setShowLabelEditor,

  openNote,
  handleTyping,
  handleUndo,
  handleRedo,
  handleClose,
  deleteCurrentNote,
  toggleArchive,
};

}
