import mongoose from "mongoose";
import User from "./User.js";


const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim:true
    },
    content: {
        type: String,
        required: [true, "content is required"],
        
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required:true,
    },


},{timestamps:true})



const Note = mongoose.model("Note", notesSchema);

export default Note;