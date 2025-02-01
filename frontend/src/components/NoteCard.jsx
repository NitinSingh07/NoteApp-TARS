import React, { useState, useRef, useEffect } from "react";
import {
  FaTrash,
  FaStar,
  FaEdit,
  FaPlay,
  FaPause,
  FaCopy,
} from "react-icons/fa";
import { toast } from "react-toastify";

const NoteCard = ({ note, onDelete, onEdit, onToggleFavorite }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Cleanup audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    try {
      if (!audioRef.current && note.audioUrl) {
        console.log("Creating new audio with URL:", note.audioUrl); // Debug log
        audioRef.current = new Audio(note.audioUrl);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          console.log("Audio playback ended"); // Debug log
        };
        audioRef.current.onerror = (e) => {
          console.error("Audio playback error:", e); // Debug log
          setIsPlaying(false);
          toast.error("Error playing audio");
        };
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              console.log("Audio playing successfully"); // Debug log
            })
            .catch((error) => {
              console.error("Audio playback failed:", error);
              toast.error("Failed to play audio");
            });
        }
      }
    } catch (error) {
      console.error("Toggle audio error:", error);
      toast.error("Error playing audio");
    }
  };

  const handleCopy = (e) => {
    e.stopPropagation(); // Prevent card click event
    const textToCopy = `${note.title}\n\n${note.content}`;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        toast.success("Note copied to clipboard");
      },
      (err) => {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy note");
      }
    );
  };

  const handleCardClick = () => {
    onEdit(note);
  };

  return (
    <div
      className="group p-6 bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-100 relative overflow-hidden cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {note.title}
          </h2>

          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
            {new Date(note.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note._id);
            }}
            className={`transform hover:scale-110 transition-transform p-1.5 rounded-full ${
              note.favorite
                ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
            }`}
          >
            <FaStar className="w-4 h-4" />
          </button>
        </div>

        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {note.content}
        </p>

        {note.imageUrl && (
          <img
            src={note.imageUrl}
            alt="Note attachment"
            className="w-full h-48 object-cover rounded-lg mb-4 shadow-md hover:shadow-lg transition-shadow"
          />
        )}

        {note.audioUrl && (
          <div className="mt-3 flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
            <button
              onClick={toggleAudio}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isPlaying
                  ? "bg-red-500 hover:bg-red-600 scale-105"
                  : "bg-green-500 hover:bg-green-600"
              } text-white shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              {isPlaying ? (
                <FaPause className="w-4 h-4" />
              ) : (
                <FaPlay className="w-4 h-4" />
              )}
            </button>
            <span
              className={`text-sm font-medium ${
                isPlaying ? "text-red-600" : "text-gray-600"
              }`}
            >
              {isPlaying ? "Playing..." : "Play Audio"}
            </span>
          </div>
        )}

        <div className="flex space-x-3 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="transform hover:scale-110 transition-transform p-1.5 rounded-full text-blue-500 hover:bg-blue-50"
          >
            <FaEdit className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="transform hover:scale-110 transition-transform p-1.5 rounded-full text-green-500 hover:bg-green-50"
            title="Copy note"
          >
            <FaCopy className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note._id);
            }}
            className="transform hover:scale-110 transition-transform p-1.5 rounded-full text-red-500 hover:bg-red-50"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
