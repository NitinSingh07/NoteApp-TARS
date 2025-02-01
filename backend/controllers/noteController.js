import Note from "../models/note.js";
import path from "path";
import { mkdir } from "fs/promises";

export const createNote = async (req, res) => {
  try {
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);

    const { title, content, transcription } = req.body;
    let imageUrl = "";
    let audioUrl = "";

    // Ensure directories exist
    await mkdir(path.join('public', 'uploads', 'images'), { recursive: true });
    await mkdir(path.join('public', 'uploads', 'audio'), { recursive: true });

    // Handle image upload
    if (req.files && req.files.image) {
      const imageFile = req.files.image;
      console.log('Processing image:', imageFile.name, imageFile.mimetype);

      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedImageTypes.includes(imageFile.mimetype)) {
        throw new Error('Invalid image type. Only JPEG, PNG and GIF are allowed.');
      }

      const imageFilename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      const imageUploadPath = path.join('public', 'uploads', 'images', imageFilename);
      
      await imageFile.mv(imageUploadPath);
      imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${imageFilename}`;
      console.log('Image saved:', imageUrl);
    }

    // Handle audio upload
    if (req.files && req.files.audio) {
      const audioFile = req.files.audio;
      console.log('Processing audio:', audioFile.name, audioFile.mimetype);

      const allowedAudioTypes = ['audio/webm', 'audio/webm;codecs=opus'];
      if (!allowedAudioTypes.some(type => audioFile.mimetype.startsWith(type))) {
        throw new Error('Invalid audio type. Only WebM audio is allowed.');
      }

      const audioFilename = `${Date.now()}-${audioFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      const audioUploadPath = path.join('public', 'uploads', 'audio', audioFilename);
      
      await audioFile.mv(audioUploadPath);
      audioUrl = `${req.protocol}://${req.get('host')}/uploads/audio/${audioFilename}`;
      console.log('Audio saved:', audioUrl);
    }

    // Create note with all media
    const note = await Note.create({
      userId: req.user.id,
      title,
      content,
      imageUrl,
      audioUrl,
      transcription: transcription || ""
    });

    // console.log('Created note:', note);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
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
    const { id } = req.params;
    let updateData = {};

    // Extract basic fields
    updateData.title = req.body.title;
    updateData.content = req.body.content;
    updateData.transcription = req.body.transcription || "";

    console.log('Update request:', {
      body: req.body,
      files: req.files,
      params: req.params
    });

    // Handle image upload/update
    if (req.files?.image) {
      const imageFile = req.files.image;
      console.log('Processing updated image:', imageFile.name);

      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedImageTypes.includes(imageFile.mimetype)) {
        throw new Error('Invalid image type');
      }

      const imageFilename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      const imageUploadPath = path.join('public', 'uploads', 'images', imageFilename);
      
      await imageFile.mv(imageUploadPath);
      updateData.imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${imageFilename}`;
    } else if (req.body.imageUrl) {
      updateData.imageUrl = req.body.imageUrl;
    }

    // Handle audio upload/update
    if (req.files?.audio) {
      const audioFile = req.files.audio;
      console.log('Processing updated audio:', audioFile.name);

      const audioFilename = `${Date.now()}-${audioFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      const audioUploadPath = path.join('public', 'uploads', 'audio', audioFilename);
      
      await audioFile.mv(audioUploadPath);
      updateData.audioUrl = `${req.protocol}://${req.get('host')}/uploads/audio/${audioFilename}`;
    } else if (req.body.audioUrl) {
      updateData.audioUrl = req.body.audioUrl;
    }

    console.log('Update data:', updateData);

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true }
    );

    if (!note) {
      throw new Error('Note not found');
    }

    res.json(note);
  } catch (error) {
    console.error('Update error:', error);
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
