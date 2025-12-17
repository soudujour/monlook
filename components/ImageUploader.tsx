
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

const UploadIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-gray-500 mb-3">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <UploadIcon />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Envie sua foto</h2>
        <p className="text-gray-500 max-w-xs">
          Para começar, envie uma foto sua ou use a câmera para tirar uma nova.
        </p>
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
            capture="user"
        />
        <button
            onClick={handleClick}
            className="mt-6 px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg shadow-md hover:bg-yellow-600 transition-colors duration-300"
        >
            Selecionar Foto ou Usar Câmera
        </button>
    </div>
  );
};
