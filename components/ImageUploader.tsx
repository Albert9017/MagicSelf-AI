import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageSelected(file);
      }
    }
  }, [onImageSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  }, [onImageSelected]);

  return (
    <div 
      className={`relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${
        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <input 
        id="file-upload"
        type="file" 
        className="hidden" 
        accept="image/*"
        onChange={handleFileInput}
      />
      
      <div className="bg-indigo-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
        <Upload className="w-8 h-8 text-indigo-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload a photo</h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        Drag and drop your image here, or click to browse. 
        Works best with clear portraits or selfies.
      </p>
      
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <ImageIcon className="w-4 h-4" />
        <span>Supports JPG, PNG, WEBP</span>
      </div>
    </div>
  );
};