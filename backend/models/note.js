import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
  favorite: { type: Boolean, default: false },
  imageUrl: String,
  audioUrl: String,
  transcription: String, // Add this field
});

export default mongoose.model("Note", noteSchema);
