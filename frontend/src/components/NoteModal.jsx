import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaTimes, FaPlay, FaPause, FaDownload } from "react-icons/fa";  // Add FaDownload
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
      setTitle(note.title);
      setContent(note.content);
      setPreviewUrl(note.imageUrl || "");
      setAudioBlob(note.audioBlob || null);
    } else {
      setTitle("");
      setContent("");
      setPreviewUrl("");
      setSelectedImage(null);
      setAudioBlob(null);
    }
  }, [note]);

  useEffect(() => {
    if (note?.audioUrl) {
      // Initialize Web Speech API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          setTranscription(transcript);
        };
      }
    }
  }, [note?.audioUrl]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
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
      formData.append("transcription", transcription || "");
      
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      
      if (audioBlob) {
        // Log the audio blob details
        console.log('Audio blob:', {
          size: audioBlob.size,
          type: audioBlob.type
        });

        // Create a new File with proper MIME type
        const audioFile = new File([audioBlob], 'recording.webm', {
          type: 'audio/webm',
          lastModified: Date.now()
        });
        formData.append("audio", audioFile);
      }

      // Log the FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File(${value.name}, ${value.type})` : value);
      }

      const result = await onSubmit(formData);
      console.log('Submit result:', result);

      if (result) {
        toast.success(note ? 'Note updated successfully' : 'Note created successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error saving note:', error);
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
        console.error('Audio loading error:', e);
        toast.error('Error loading audio file');
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
            console.error('Audio playback error:', error);
            toast.error('Error playing audio');
          });
        }
        setIsPlayingOldRecording(true);
      }
    } catch (error) {
      console.error('Audio toggle error:', error);
      toast.error('Error controlling audio playback');
    }
  };

  const handleDownloadAudio = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(note.audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `note-recording-${note._id}.wav`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Audio downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download audio');
    }
  };

  const handleRecordingComplete = (blob, transcript) => {
    console.log('Recording completed:', blob); // Debug log
    setAudioBlob(blob);
    setTranscription(transcript);
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
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Image</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center w-full">
                      <label className="w-full flex flex-col items-center justify-center px-4 py-6 bg-white text-gray-500 rounded-lg shadow-lg tracking-wide border border-blue-100 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                        <svg className="w-8 h-8 text-blue-500" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.c-74-.12-1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
                        </svg>
                        <span className="mt-2 text-sm">Select an image</span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                    </div>
                    {previewUrl && (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setPreviewUrl("");
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <FaTimes size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audio Section with Transcription */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Audio</label>
                  {note?.audioUrl && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={toggleOldRecording}
                            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600"
                          >
                            {isPlayingOldRecording ? <FaPause size={12} /> : <FaPlay size={12} />}
                          </button>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-600">Previous Recording</span>
                            {/* <span className="text-xs text-gray-400">
                              {formatDuration(oldAudioCurrentTime)} / {formatDuration(oldAudioDuration)}
                            </span> */}
                          </div>
                        </div>
                        <button
                          onClick={handleDownloadAudio}
                          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          title="Download audio"
                        >
                          <FaDownload size={12} />
                        </button>
                      </div>

                      {/* Transcription Display */}
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Transcription</span>
                          {transcription && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(transcription);
                                toast.success('Transcription copied to clipboard');
                              }}
                              className="text-xs text-blue-500 hover:text-blue-600"
                            >
                              Copy Text
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 min-h-[60px]">
                          {transcription || note.transcription || 'No transcription available'}
                        </p>
                      </div>
                    </div>
                  )}
                  <Recorder 
                    onRecordingComplete={handleRecordingComplete} 
                  />
                </div>              </div>
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
