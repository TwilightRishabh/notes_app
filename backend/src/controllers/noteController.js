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
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Destructure fields that may come from frontend
    const { title, content, isPinned, isArchived } = req.body;

    // Update ONLY provided fields
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;

    // If both title + content empty → delete permanently
    if (!note.title && !note.content) {
      await note.deleteOne();
      return res.json({ deleted: true, id: note._id });
    }



    const updated = await note.save();
    res.json(updated);

  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// =======================
// Delete Note (Soft delete + Permanent delete)
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

    // If note is NOT already in trash → move to trash
    if (!note.isDeleted) {
      note.isDeleted = true;
      note.isPinned = false;
      note.isArchived = false;

      const trashed = await note.save();
      return res.json({ movedToTrash: true, note: trashed });
    }

    // If already in trash → delete permanently
    await note.deleteOne();
    return res.json({ deletedForever: true });

  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

