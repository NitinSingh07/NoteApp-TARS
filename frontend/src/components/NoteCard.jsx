import React, { useState, useRef, useEffect } from "react";
import { FaTrash, FaStar, FaEdit, FaPlay, FaPause } from "react-icons/fa";

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
        console.log('Creating new audio with URL:', note.audioUrl); // Debug log
        audioRef.current = new Audio(note.audioUrl);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          console.log('Audio playback ended'); // Debug log
        };
        audioRef.current.onerror = (e) => {
          console.error('Audio playback error:', e); // Debug log
          setIsPlaying(false);
          toast.error('Error playing audio');
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
              console.log('Audio playing successfully'); // Debug log
            })
            .catch(error => {
              console.error('Audio playback failed:', error);
              toast.error('Failed to play audio');
            });
        }
      }
    } catch (error) {
      console.error('Toggle audio error:', error);
      toast.error('Error playing audio');
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold text-gray-800">{note.title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleFavorite(note._id)}
            className={`p-1 rounded ${
              note.favorite ? "text-yellow-500" : "text-gray-400"
            }`}
          >
            <FaStar />
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1 text-blue-500 hover:text-blue-700"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1 text-red-500 hover:text-red-700"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <p className="text-gray-600">{note.content}</p>
      {note.imageUrl && (
        <img
          src={note.imageUrl}
          alt="Note attachment"
          className="mt-2 max-h-40 rounded"
        />
      )}
      {note.audioUrl && (
        <div className="mt-2 flex items-center space-x-2">
          <button
            onClick={toggleAudio}
            className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600"
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <span className="text-sm text-gray-500">
            {isPlaying ? 'Playing...' : 'Audio available'}
          </span>
        </div>
      )}
      <div className="text-xs text-gray-400 mt-2">
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default NoteCard;
