import React, { useState } from 'react';
import { FaTimes, FaExpand, FaCompress } from 'react-icons/fa';

const FullscreenModal = ({ isOpen, onClose, children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-all duration-300 ${
      isFullscreen ? 'p-0' : 'p-4'
    }`}>
      <div className={`relative bg-white transition-all duration-300 ${
        isFullscreen 
          ? 'w-full h-full rounded-none' 
          : 'w-full max-w-4xl mx-auto rounded-2xl'
      }`}>
        <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>
        <div className={`${isFullscreen ? 'h-screen overflow-auto' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullscreenModal;
