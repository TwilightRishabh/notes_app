import Note from "../models/Note.js";

// =======================
// Create Note
// =======================
export const createNote = async (req, res) => {
  try {
    let { title = "", content = "", color = "#FFFFFF", labels = [] } = req.body;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle && !trimmedContent) {
      return res
        .status(400)
        .json({ message: "Title or content is required" });
    }

    // ⭐ Ensure labels are clean + unique
    if (!Array.isArray(labels)) labels = [];
    labels = labels
      .map(l => String(l).trim())
      .filter(l => l.length > 0);
    labels = [...new Set(labels)];

    const note = await Note.create({
      title: trimmedTitle,
      content: trimmedContent,
      color,
      labels,
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

    const onlyDeleted = req.query.onlyDeleted === "true";

    const query = { user: userId };

    if (onlyDeleted) {
      query.isDeleted = true;
    } else {
      query.isDeleted = { $ne: true };
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

    let {
      title,
      content,
      isPinned,
      isArchived,
      isDeleted,
      color,
      labels
    } = req.body;

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;
    if (isDeleted !== undefined) note.isDeleted = isDeleted;
    if (color !== undefined) note.color = color;

    // ⭐ Handle label update safely
    if (labels !== undefined) {
      if (!Array.isArray(labels)) labels = [];
      labels = labels
        .map(l => String(l).trim())
        .filter(l => l.length > 0);
      labels = [...new Set(labels)];
      note.labels = labels;
    }

    // delete permanently if empty
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

    // Move to trash first
    if (!note.isDeleted) {
      note.isDeleted = true;
      note.isPinned = false;
      note.isArchived = false;
      note.deletedAt = Date.now();

      const trashed = await note.save();
      return res.json({ movedToTrash: true, note: trashed });
    }

    // Delete permanently
    await note.deleteOne();
    res.json({ deletedForever: true });

  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
