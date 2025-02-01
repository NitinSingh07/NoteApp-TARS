import React, { useEffect, useState } from "react";
import { getNotes, createNote, deleteNote, updateNote, toggleFavorite } from "../api/notes";
import Navbar from "../components/Navbar";
import NoteCard from "../components/NoteCard";
import SearchBar from "../components/Search";
import NoteModal from "../components/NoteModal";
import { toast } from 'react-toastify';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotes();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to fetch notes', error.message);
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      if (editingNote) {
        const noteData = Object.fromEntries(formData.entries());
        await updateNote(editingNote._id, noteData);
        toast.success('Note updated successfully');
      } else {
        const result = await createNote(formData);
        console.log('Created note:', result); // Debug log
        if (result) {
          toast.success('Note created successfully');
          // Immediately update notes array with new note
          setNotes(prevNotes => [result, ...prevNotes]);
        }
      }
      setIsModalOpen(false);
      setEditingNote(null);
      // Fetch fresh data from server
      await fetchNotes();
    } catch (error) {
      toast.error(error.message || 'Error saving note');
      console.error('Note operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id);
      fetchNotes();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const filteredNotes = notes.filter(
    (note) => 
      note.title?.toLowerCase().includes(search.toLowerCase()) || 
      note.content?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <SearchBar 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full md:w-96"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </span>
            ) : (
              'Create Note'
            )}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-center my-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!loading && filteredNotes.length === 0 && (
          <div className="text-center text-gray-500 my-8">
            {search ? 'No notes found matching your search' : 'No notes yet. Create your first note!'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filteredNotes.map((note, index) => (
            <div 
              key={note._id} 
              className="animate-slideUp hover:scale-[1.02] transition-transform duration-200"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <NoteCard
                note={note}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onToggleFavorite={handleToggleFavorite}
              />
            </div>
          ))}
        </div>

        {isModalOpen && (
          <NoteModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingNote(null);
            }}
            onSubmit={handleSubmit}
            note={editingNote}
          />
        )}
      </div>
    </div>
  );
};

export default Notes;
