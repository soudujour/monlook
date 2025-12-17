
import React from 'react';

interface MainDisplayProps {
  imageSrc: string;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
);

export const MainDisplay: React.FC<MainDisplayProps> = ({ imageSrc, isLoading }) => {
  return (
    <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
      <img src={imageSrc} alt="User" className="w-full h-full object-contain" />
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white p-4">
          <LoadingSpinner />
          <p className="mt-4 text-lg font-semibold text-center">Aplicando o acessório...</p>
          <p className="text-sm text-center">Isso pode levar alguns segundos.</p>
        </div>
      )}
    </div>
  );
};
