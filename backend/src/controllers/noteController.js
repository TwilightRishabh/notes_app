import Note from "../models/Note.js";

// Create Note
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    // basic validation
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // req.user is set by the protect middleware
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    const note = await Note.create({
      title,
      content,
      user: userId,
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get All Notes of the logged-in user
export const getNotes = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ message: "Not authorized" });

    // Find notes that belong to this user, newest first
    const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error("Get notes error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Note
export const updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content } = req.body;
    const userId = req.user && req.user._id;

    if (!userId) return res.status(401).json({ message: "Not authorized" });

    // 1) Find the note
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // 2) Owner check
    if (note.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized to update this note" });
    }

    // 3) Update allowed fields (only if provided)
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;

    const updated = await note.save();
    res.json(updated);
  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Delete Note
export const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user && req.user._id;

    if (!userId) return res.status(401).json({ message: "Not authorized" });

    // 1) Find the note
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    // 2) Owner check
    if (note.user.toString() !== userId.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this note" });
    }

    // 3) Remove the note
    await Note.findByIdAndDelete(noteId);     //updated


    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

