import Note from "../models/Note.js";

// =======================
// Create Note
// =======================
export const createNote = async (req, res) => {
  try {
    const { title = "", content = "" } = req.body;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      return res
        .status(400)
        .json({ message: "Title or content is required" });
    }

    const note = await Note.create({
      title: trimmedTitle,
      content: trimmedContent,
      user: req.user._id,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =======================
// Get Notes
// =======================
export const getNotes = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// Update OR Delete Note
// =======================
export const updateNote = async (req, res) => {
  try {
    const { title = "", content = "" } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (note.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    // ✅ delete only if BOTH empty
    if (!trimmedTitle && !trimmedContent) {
      await Note.findByIdAndDelete(note._id);
      return res.json({ deleted: true, id: note._id });
    }

    // ✅ partial updates allowed
    note.title = trimmedTitle;
    note.content = trimmedContent;

    const updated = await note.save();
    res.json(updated);

  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =======================
// Delete Note (Manual)
// =======================
export const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user && req.user._id;

    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
