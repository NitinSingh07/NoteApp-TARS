import Note from "../models/note.js";

export const createNote = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    let audioUrl = "";

    if (req.files && req.files.audio) {
      const audioFile = req.files.audio;
      const filename = `${Date.now()}-${audioFile.name}`;
      await audioFile.mv(`public/uploads/${filename}`);
      // Update the audioUrl to include the full server URL
      audioUrl = `http://localhost:5000/uploads/${filename}`;
    }

    const note = await Note.create({
      userId: req.user.id,
      title,
      content,
      imageUrl,
      audioUrl,
    });

    // console.log('Created note with audio:', note); // Debug log
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(notes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json({ message: "Note deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });
    note.favorite = !note.favorite;
    await note.save();
    res.json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
