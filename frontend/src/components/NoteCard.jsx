import React from "react";
import { FaTrash, FaStar, FaEdit } from "react-icons/fa";

const NoteCard = ({ note, onDelete, onEdit, onToggleFavorite }) => {
  return (
    <div className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-bold text-gray-800">{note.title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleFavorite(note._id)}
            className={`p-1 rounded ${note.favorite ? 'text-yellow-500' : 'text-gray-400'}`}
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
      <div className="text-xs text-gray-400 mt-2">
        {new Date(note.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default NoteCard;
