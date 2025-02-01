import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaTimes, FaPlay, FaPause } from "react-icons/fa";
import { toast } from "react-toastify";
import Recorder from "./Recorder";
import FullscreenModal from "./FullscreenModal";

const NoteModal = ({ isOpen, onClose, onSubmit, note, onToggleFavorite }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isPlayingOldRecording, setIsPlayingOldRecording] = useState(false);
  const oldAudioRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setImageUrl(note.imageUrl || "");
      setAudioBlob(note.audioBlob || null);
    } else {
      setTitle("");
      setContent("");
      setImageUrl("");
      setAudioBlob(null);
    }
  }, [note]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (imageUrl) formData.append("imageUrl", imageUrl.trim());
      if (selectedImage) formData.append("image", selectedImage);
      if (audioBlob) formData.append("audio", audioBlob, "recording.wav");

      console.log(
        "Form data being sent:",
        Object.fromEntries(formData.entries())
      ); // Debug log
      await onSubmit(formData);

      // Reset form
      setTitle("");
      setContent("");
      setImageUrl("");
      setAudioBlob(null);
      setSelectedImage(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOldRecording = () => {
    if (!oldAudioRef.current && note?.audioUrl) {
      oldAudioRef.current = new Audio(note.audioUrl);
      oldAudioRef.current.onended = () => setIsPlayingOldRecording(false);
    }

    if (isPlayingOldRecording) {
      oldAudioRef.current?.pause();
    } else {
      oldAudioRef.current?.play();
    }
    setIsPlayingOldRecording(!isPlayingOldRecording);
  };

  if (!isOpen) return null;

  return (
    <FullscreenModal isOpen={isOpen} onClose={onClose}>
      <div className="p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {note ? "Edit Note" : "Create Note"}
            </h2>
            {note && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite(note._id);
                }}
                className={`p-2 rounded-full transition-all duration-300 ${
                  note?.favorite
                    ? "bg-yellow-50 text-yellow-500"
                    : "text-gray-400 hover:text-yellow-500"
                }`}
              >
                <FaStar className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Two Column Layout for Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* Title and Content */}
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 h-[calc(100vh-400px)] min-h-[200px]"
                required
              />
            </div>

            <div className="space-y-4">
              {/* Media Section */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Image</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border text-sm"
                    />
                    <span className="text-gray-400">or</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageSelect}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
                    >
                      Upload
                    </button>
                  </div>
                  {selectedImage && (
                    <div className="relative mt-2">
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Audio Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Audio</label>
                  {note?.audioUrl && (
                    <div className="flex items-center space-x-2 p-2 bg-white rounded-lg mb-2">
                      <button
                        type="button"
                        onClick={toggleOldRecording}
                        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                      >
                        {isPlayingOldRecording ? <FaPause size={12} /> : <FaPlay size={12} />}
                      </button>
                      <span className="text-sm text-gray-600">Previous Recording</span>
                    </div>
                  )}
                  <Recorder onRecordingComplete={setAudioBlob} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : note ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </FullscreenModal>
  );
};

export default NoteModal;
