import axios from "axios";

const API_URL = "http://localhost:5000/api/notes";

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
};

const config = () => {
  try {
    return {
      headers: { Authorization: `Bearer ${getToken()}` }
    };
  } catch (error) {
    throw new Error('Authentication required');
  }
};

export const getNotes = async () => {
  try {
    const res = await axios.get(API_URL, config());
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch notes');
  }
};

export const createNote = async (noteData) => {
  try {
    const res = await axios.post(API_URL, noteData, config());
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login
      throw new Error('Please login again');
    }
    throw new Error(error.response?.data?.message || 'Failed to create note');
  }
};

export const updateNote = async (id, noteData) => {
  try {
    const res = await axios.put(
      `${API_URL}/${id}`,
      noteData,
      config()
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login
      throw new Error('Please login again');
    }
    throw new Error(error.response?.data?.message || 'Failed to update note');
  }
};

export const deleteNote = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, config());
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login
      throw new Error('Please login again');
    }
    throw new Error(error.response?.data?.message || 'Failed to delete note');
  }
};

export const toggleFavorite = async (id) => {
  try {
    const res = await axios.patch(
      `${API_URL}/${id}/favorite`,
      {},
      config()
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login
      throw new Error('Please login again');
    }
    throw new Error(error.response?.data?.message || 'Failed to toggle favorite');
  }
};
