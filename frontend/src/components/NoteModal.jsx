import React, { useState, useEffect, useRef } from "react";
import {
  FaStar,
  FaTimes,
  FaPlay,
  FaPause,
  FaDownload,
  FaShareAlt,
} from "react-icons/fa"; // Add FaDownload
import { toast } from "react-toastify";
import Recorder from "./Recorder";
import FullscreenModal from "./FullscreenModal";
// import { formatDuration } from '../utils/formatTime';  // Add this import

const NoteModal = ({ isOpen, onClose, onSubmit, note, onToggleFavorite }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const fileInputRef = useRef(null);
  const [isPlayingOldRecording, setIsPlayingOldRecording] = useState(false);
  const oldAudioRef = useRef(null);
  const [transcription, setTranscription] = useState("");
  const [oldAudioDuration, setOldAudioDuration] = useState(0);
  const [oldAudioCurrentTime, setOldAudioCurrentTime] = useState(0);

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setPreviewUrl(note.imageUrl || "");
      setTranscription(note.transcription || "");
      // Don't reset selectedImage and audioBlob when editing
    } else {
      setTitle("");
      setContent("");
      setPreviewUrl("");
      setSelectedImage(null);
      setAudioBlob(null);
      setTranscription("");
    }
  }, [note]);

  useEffect(() => {
    if (note?.audioUrl) {
      // Initialize Web Speech API
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");
          setTranscription(transcript);
        };
      }
    }
  }, [note?.audioUrl]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl("");
    if (note?.imageUrl) {
      formData.append("removeImage", "true");
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

      // Add basic fields
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("transcription", transcription || "");

      // Handle image
      if (selectedImage) {
        console.log("Appending image:", selectedImage.name);
        formData.append("image", selectedImage);
      }

      // Handle audio
      if (audioBlob) {
        console.log("Appending audio");
        const audioFile = new File([audioBlob], "recording.webm", {
          type: "audio/webm",
          lastModified: Date.now(),
        });
        formData.append("audio", audioFile);
      }

      // Keep existing URLs if no new files are selected
      if (!selectedImage && note?.imageUrl) {
        formData.append("imageUrl", note.imageUrl);
      }
      if (!audioBlob && note?.audioUrl) {
        formData.append("audioUrl", note.audioUrl);
      }

      const result = await onSubmit(formData);

      if (result) {
        toast.success(
          note ? "Note updated successfully" : "Note created successfully"
        );
        onClose();
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(error.message || "Failed to save note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOldRecording = () => {
    if (!oldAudioRef.current && note?.audioUrl) {
      oldAudioRef.current = new Audio(note.audioUrl);

      // Add error handling for audio loading
      oldAudioRef.current.onerror = (e) => {
        console.error("Audio loading error:", e);
        toast.error("Error loading audio file");
        setIsPlayingOldRecording(false);
      };

      oldAudioRef.current.onended = () => {
        setIsPlayingOldRecording(false);
      };

      oldAudioRef.current.onloadedmetadata = () => {
        setOldAudioDuration(oldAudioRef.current.duration);
      };

      oldAudioRef.current.ontimeupdate = () => {
        setOldAudioCurrentTime(oldAudioRef.current.currentTime);
      };
    }

    try {
      if (isPlayingOldRecording) {
        oldAudioRef.current?.pause();
        setIsPlayingOldRecording(false);
      } else {
        const playPromise = oldAudioRef.current?.play();
        if (playPromise) {
          playPromise.catch((error) => {
            console.error("Audio playback error:", error);
            toast.error("Error playing audio");
          });
        }
        setIsPlayingOldRecording(true);
      }
    } catch (error) {
      console.error("Audio toggle error:", error);
      toast.error("Error controlling audio playback");
    }
  };

  const handleDownloadAudio = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(note.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `note-recording-${note._id}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Audio downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download audio");
    }
  };

  const handleRecordingComplete = (blob, transcript) => {
    console.log("Recording completed:", blob); // Debug log
    setAudioBlob(blob);
    setTranscription(transcript);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    const shareData = {
      title: title,
      text: `${title}\n\n${content}`,
      // You can add a specific URL if needed
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        // Use native sharing on supported devices
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } else {
        // Fallback to clipboard copy
        const shareText = `${title}\n\n${content}`;
        await navigator.clipboard.writeText(shareText);
        toast.success("Content copied to clipboard");
      }
    } catch (error) {
      console.error("Share failed:", error);
      toast.error("Failed to share");
    }
  };

  if (!isOpen) return null;

  return (
    <FullscreenModal isOpen={isOpen} onClose={onClose}>
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50/30">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative px-6 py-4 border-b border-gray-100/50 backdrop-blur-sm bg-white/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {note ? "Edit Note" : "Create Note"}
                </h2>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600/50 to-purple-600/50 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
              </div>
              {note && (
                <div className="flex items-center gap-2 animate-fade-in">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onToggleFavorite(note._id);
                    }}
                    className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-12 ${
                      note?.favorite
                        ? "bg-yellow-50 text-yellow-500 shadow-lg shadow-yellow-500/20"
                        : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
                    }`}
                  >
                    <FaStar className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full text-gray-400 hover:text-purple-500 transition-all duration-300 transform hover:scale-110 hover:-rotate-12 hover:bg-purple-50"
                  >
                    <FaShareAlt className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="relative group p-2 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="absolute inset-0 rounded-full bg-gray-100 scale-0 group-hover:scale-100 transition-transform"></span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            onSubmit={handleSubmit}
            className="h-full flex flex-col max-w-7xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
              {/* Left Column - Content */}
              <div className="lg:col-span-2 flex flex-col gap-2">
                <div className="group">
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 text-lg font-medium placeholder:text-gray-400"
                    required
                  />
                  <div className="h-0.5 w-0 group-focus-within:w-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"></div>
                </div>
                <textarea
                  placeholder="Write your thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="flex-1 w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300 max-h-[400px] placeholder:text-gray-400 resize-none"
                  required
                />
              </div>

              {/* Right Column - Media Cards */}
              <div className="space-y-6">
                {/* Image Upload Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700">
                      Image
                    </label>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {!previewUrl ? (
                    <label className="relative group cursor-pointer">
                      <div className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <svg
                            className="w-6 h-6 text-blue-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-500">
                          Click to upload image
                        </span>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden group">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full aspect-video object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 bg-red-500 text-white rounded-full transform -translate-y-full group-hover:translate-y-0 transition-transform"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Recording Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                  <label className="text-sm font-medium text-gray-700 block mb-4">
                    Audio
                  </label>
                  <div className="space-y-4">
                    {note?.audioUrl && (
                      <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={toggleOldRecording}
                            className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center transform group-hover:scale-110 transition-transform"
                          >
                            {isPlayingOldRecording ? (
                              <FaPause size={12} />
                            ) : (
                              <FaPlay size={12} />
                            )}
                          </button>
                          <span className="text-sm text-gray-600">
                            Previous Recording
                          </span>
                        </div>
                        <button
                          onClick={handleDownloadAudio}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FaDownload size={14} />
                        </button>
                      </div>
                    )}
                    <Recorder onRecordingComplete={handleRecordingComplete} />
                  </div>
                </div>

                {/* Transcription Card */}
                {(transcription || note?.transcription) && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-gray-700">
                        Transcription
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            transcription || note.transcription
                          );
                          toast.success("Copied to clipboard");
                        }}
                        className="text-xs text-blue-500 hover:text-blue-600"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                      {transcription || note.transcription}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg overflow-hidden group disabled:opacity-50"
              >
                <span className="relative z-10">
                  {isSubmitting ? "Saving..." : note ? "Update" : "Create"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </FullscreenModal>
  );
};

export default NoteModal;
