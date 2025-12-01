import React, { useState } from 'react';
import { X, Wand2, RefreshCw } from 'lucide-react';
import { GeneratedImage } from '../types';
import { Button } from './Button';
import { editImageWithPrompt } from '../services/geminiService';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceImage: GeneratedImage | null;
  onSave: (newImage: GeneratedImage) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, sourceImage, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && sourceImage) {
      setCurrentImage(sourceImage.url);
      setPrompt('');
      setError(null);
    }
  }, [isOpen, sourceImage]);

  if (!isOpen || !sourceImage) return null;

  const handleEdit = async () => {
    if (!prompt.trim() || !currentImage) return;

    setIsProcessing(true);
    setError(null);
    try {
      const newImageUrl = await editImageWithPrompt(currentImage, prompt);
      setCurrentImage(newImageUrl);
    } catch (err) {
      setError("Failed to edit image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndClose = () => {
    if (currentImage) {
      onSave({
        ...sourceImage,
        id: crypto.randomUUID(),
        url: currentImage,
        styleName: `${sourceImage.styleName} (Edited)`,
        promptUsed: prompt
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="absolute top-4 right-4 z-10">
            <button onClick={onClose} className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 focus:outline-none">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
            {/* Image Preview Area */}
            <div className="w-full md:w-2/3 bg-gray-900 flex items-center justify-center p-6 relative">
               <div className="relative max-w-full max-h-full">
                 {currentImage && (
                   <img 
                    src={currentImage} 
                    alt="Editing" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                   />
                 )}
                 {isProcessing && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                     <RefreshCw className="w-12 h-12 text-white animate-spin mb-4" />
                     <p className="text-white font-medium">Gemini is processing edits...</p>
                   </div>
                 )}
               </div>
            </div>

            {/* Controls Area */}
            <div className="w-full md:w-1/3 bg-white p-6 flex flex-col border-l border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Magic Edit</h3>
              <p className="text-sm text-gray-500 mb-6">Describe how you want to change the image.</p>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Make it black and white, Add sunglasses, Change background to a city..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                />
                
                {error && (
                  <div className="mt-2 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
                
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Quick Prompts</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Make it cyberpunk', 'Add a retro filter', 'Make it sketch style', 'Remove background'].map(p => (
                      <button
                        key={p}
                        onClick={() => setPrompt(p)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 rounded-full transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button 
                  onClick={handleEdit} 
                  isLoading={isProcessing} 
                  disabled={!prompt.trim() || isProcessing}
                  icon={<Wand2 className="w-4 h-4"/>}
                  className="w-full"
                >
                  Generate Edit
                </Button>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={onClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={handleSaveAndClose} className="flex-1">
                    Save Result
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};