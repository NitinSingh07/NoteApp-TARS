import axios from "axios";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/notes`;

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
    throw new Error('Authentication required', error.message);
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

export const createNote = async (formData) => {
  try {
    console.log('API createNote called with:', formData); // Debug log
    
    const res = await axios.post(API_URL, formData, {
      ...config(),
      headers: {
        ...config().headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('API response:', res.data); // Debug log
    return res.data;
  } catch (error) {
    console.error('API error:', error); // Debug log
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Clear invalid token
      window.location.href = '/login'; // Redirect to login
      throw new Error('Please login again');
    }
    throw new Error(error.response?.data?.message || 'Failed to create note');
  }
};

export const updateNote = async (id, formData) => {
  try {
    // Fix the URL (remove duplicate 'notes')
    const res = await axios.put(`${API_URL}/${id}`, formData, {
      ...config(),
      headers: {
        ...config().headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Update response:', res.data); // Debug log
    return res.data;
  } catch (error) {
    console.error('Update error:', error.response || error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
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
