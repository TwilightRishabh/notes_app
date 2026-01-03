import Note from "../models/Note.js";

export const autoDeleteOldTrash = async () => {
  try {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const deleted = await Note.deleteMany({
      isDeleted: true,
      deletedAt: { $lte: cutoff }
    });

    if (deleted.deletedCount > 0) {
      console.log(`🗑️ Auto-deleted ${deleted.deletedCount} expired trashed notes`);
    }

  } catch (err) {
    console.error("Trash cleanup error:", err);
  }
};
