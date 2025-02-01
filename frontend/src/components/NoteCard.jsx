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
      className="group relative p-6 bg-white/90 backdrop-blur-sm rounded-xl transition-all duration-300 
                 hover:shadow-glass border border-gray-100 hover:border-blue-200/50 
                 hover:-translate-y-1 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        {/* Header section */}
        <div className="flex flex-col space-y-2 mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
            {note.title}
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 bg-gray-100/80 px-2 py-1 rounded-md">
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
              className={`transform hover:scale-110 transition-transform p-1.5 rounded-full 
                ${note.favorite 
                  ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100 shadow-md' 
                  : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
            >
              <FaStar className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3 group-hover:text-gray-700">
          {note.content}
        </p>

        {note.imageUrl && (
          <div className="relative overflow-hidden rounded-lg mb-4 group/image">
            <img
              src={note.imageUrl}
              alt="Note attachment"
              className="w-full h-48 object-cover transition-transform duration-700 group-hover/image:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
          </div>
        )}

        {note.audioUrl && (
          <div className="mt-3 flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-gray-100/50 p-4 rounded-lg">
            <button
              onClick={toggleAudio}
              className={`p-3 rounded-full transition-all duration-300 transform hover:scale-105
                ${isPlaying 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white shadow-lg hover:shadow-xl`}
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

        <div className="flex items-center justify-end space-x-2 mt-4 transition-all duration-300 group-hover:transform group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-2 rounded-lg bg-blue-50/50 text-blue-500 transition-all duration-300 
                       hover:scale-105 hover:bg-blue-100 hover:shadow-md"
          >
            <FaEdit className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-green-50/50 text-green-500 transition-all duration-300 
                       hover:scale-105 hover:bg-green-100 hover:shadow-md"
            title="Copy note"
          >
            <FaCopy className="w-4 h-4" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note._id);
            }}
            className="p-2 rounded-lg bg-red-50/50 text-red-500 transition-all duration-300 
                       hover:scale-105 hover:bg-red-100 hover:shadow-md"
          >
            <FaTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
