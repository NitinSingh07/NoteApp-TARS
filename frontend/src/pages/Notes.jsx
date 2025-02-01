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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <SearchBar 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Add Note'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleFavorite={handleToggleFavorite}
            />
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
