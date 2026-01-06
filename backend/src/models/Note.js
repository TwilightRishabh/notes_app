import mongoose from "mongoose";

const notesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPinned: {
      type: Boolean,
      default:false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    color: {
      type: String,
      default: "#FFFFFF"   // white note by default
    },
    labels: {
      type: [String],
      default: []
    },




  },
  { timestamps: true }
);

const Note = mongoose.model("Note", notesSchema);
export default Note;
