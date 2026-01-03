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

    // query flags for Trash page
    const onlyDeleted = req.query.onlyDeleted === "true";

    const query = { user: userId };

    if (onlyDeleted) {
      query.isDeleted = true;           // only trash
    } else {
      query.isDeleted = { $ne: true };  // exclude trash
    }

    const notes = await Note.find(query).sort({ createdAt: -1 });
    res.json(notes);

  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// =======================
// Update Note (edit / restore)
// =======================
export const updateNote = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    if (note.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // include isDeleted in updates ✅
    const { title, content, isPinned, isArchived, isDeleted } = req.body;

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (isDeleted !== undefined) note.isDeleted = isDeleted;

    // if both fields empty → permanent delete
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
// Delete Note (Trash system)
// =======================
export const deleteNote = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.user.toString() !== userId.toString())
      return res.status(401).json({ message: "Not authorized" });

    // If not yet deleted → move to trash
    if (!note.isDeleted) {
      note.isDeleted = true;
      note.isPinned = false;
      note.isArchived = false;
      note.deletedAt = Date.now();   // ⭐ IMPORTANT

      const trashed = await note.save();
      return res.json({ movedToTrash: true, note: trashed });
    }


    // If already in trash → permanent delete
    await note.deleteOne();
    res.json({ deletedForever: true });

  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
