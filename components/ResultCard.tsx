import React from 'react';
import { Download, Edit2, Maximize2 } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ResultCardProps {
  image: GeneratedImage;
  onEdit: (image: GeneratedImage) => void;
  onView: (image: GeneratedImage) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ image, onEdit, onView }) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `avatar-${image.styleName}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download image", err);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        <img 
          src={image.url} 
          alt={image.styleName} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
            <button 
              onClick={() => onView(image)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
              title="View Fullscreen"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => onEdit(image)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
              title="Edit with AI"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button 
              onClick={handleDownload}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      <div className="p-3 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{image.styleName}</span>
        </div>
      </div>
    </div>
  );
};