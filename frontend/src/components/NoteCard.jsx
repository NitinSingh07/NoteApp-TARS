import React, { useState, useRef, useEffect } from "react";
import {
  FaTrash,
  FaStar,
  FaEdit,
  FaPlay,
  FaPause,
  FaCopy,
  FaShareAlt,
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
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const toggleAudio = () => {
    try {
      if (!audioRef.current && note.audioUrl) {
        console.log("Creating new audio with URL:", note.audioUrl);

        // Create new audio element with error handling
        audioRef.current = new Audio();

        // Add event listeners before setting source
        audioRef.current.onerror = (e) => {
          console.error("Audio loading error:", e.target.error);
          toast.error("Error loading audio file");
          setIsPlaying(false);
        };

        audioRef.current.oncanplay = () => {
          console.log("Audio can play");
        };

        audioRef.current.onended = () => {
          setIsPlaying(false);
          console.log("Audio playback ended");
        };

        // Set the source and type
        audioRef.current.src = note.audioUrl;
        audioRef.current.type = "audio/webm";
      }

      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current) {
          try {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  setIsPlaying(true);
                  console.log("Audio playing successfully");
                })
                .catch((error) => {
                  console.error("Audio playback error:", error);
                  // Try to reload the audio if it fails
                  audioRef.current.load();
                  toast.error("Error playing audio");
                  setIsPlaying(false);
                });
            }
          } catch (error) {
            console.error("Play error:", error);
            toast.error("Could not play audio");
            setIsPlaying(false);
          }
        }
      }
    } catch (error) {
      console.error("Toggle audio error:", error);
      toast.error("Error controlling audio playback");
      setIsPlaying(false);
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

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: note.title,
      text: note.content,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Shared successfully");
      } else {
        // Fallback to copy link
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      console.error("Share failed:", err);
      toast.error("Failed to share");
    }
  };

  const handleCardClick = () => {
    onEdit(note);
  };

  return (
    <div
      className="group relative p-4 sm:p-5 bg-white/95 backdrop-blur-sm rounded-xl transition-all duration-300 
                 hover:shadow-glass border border-gray-100/50 hover:border-blue-200/50 
                 hover:-translate-y-1 cursor-pointer overflow-hidden
                 transform perspective-1000"
      onClick={handleCardClick}
    >
      {/* Creative gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/30 opacity-0 
                    group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"
      ></div>

      <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
        {/* Header with improved layout */}
        <div className="flex items-start justify-between mb-3">
          <h2
            className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 
                       bg-clip-text text-transparent group-hover:from-blue-600 
                       group-hover:to-purple-600 transition-all duration-300 flex-1 pr-2"
          >
            {note.title}
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note._id);
            }}
            className={`shrink-0 transform hover:scale-110 transition-all p-1.5 rounded-full 
              ${
                note.favorite
                  ? "text-yellow-500 bg-yellow-50/80 hover:bg-yellow-100 shadow-sm"
                  : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50/80"
              }`}
          >
            <FaStar className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content section with better spacing */}
        <div className="space-y-3">
          <p
            className="text-sm text-gray-600 leading-relaxed overflow-hidden 
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;"
          >
            {note.content}
          </p>

          {/* Compact image display */}
          {note.imageUrl && (
            <div className="relative h-32 sm:h-40 overflow-hidden rounded-lg group/image">
              <img
                src={note.imageUrl}
                alt="Note attachment"
                className="w-full h-full object-cover transition-transform duration-700 
                         group-hover/image:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent 
                           opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
              ></div>
            </div>
          )}

          {/* Audio player with improved styling */}
          {note.audioUrl && (
            <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-transparent p-2 rounded-lg">
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-full transition-all duration-300 transform hover:scale-105
                  ${
                    isPlaying
                      ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                      : "bg-gradient-to-r from-green-500 to-green-600"
                  } text-white shadow-sm hover:shadow-md`}
              >
                {isPlaying ? (
                  <FaPause className="w-3 h-3" />
                ) : (
                  <FaPlay className="w-3 h-3" />
                )}
              </button>
              <span className="text-xs font-medium text-gray-600">
                {isPlaying ? "Playing..." : "Play Audio"}
              </span>
            </div>
          )}

          {/* Footer with date and actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100/50">
            <span className="text-xs text-gray-400">
              {new Date(note.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg text-purple-500/80 hover:bg-purple-50/80 
                         transition-all duration-300 hover:scale-105"
              >
                <FaShareAlt className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(note);
                }}
                className="p-1.5 rounded-lg text-blue-500/80 hover:bg-blue-50/80 
                         transition-all duration-300 hover:scale-105"
              >
                <FaEdit className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-green-500/80 hover:bg-green-50/80 
                         transition-all duration-300 hover:scale-105"
              >
                <FaCopy className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note._id);
                }}
                className="p-1.5 rounded-lg text-red-500/80 hover:bg-red-50/80 
                         transition-all duration-300 hover:scale-105"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
