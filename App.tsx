import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultCard } from './components/ResultCard';
import { EditModal } from './components/EditModal';
import { Button } from './components/Button';
import { GeneratedImage, ImageAsset, StyleOption } from './types';
import { generateImageVariation } from './services/geminiService';
import { Sparkles, ArrowLeft, CheckCircle2, Trash2, Wand2 } from 'lucide-react';

const STYLES: StyleOption[] = [
  {
    name: 'Flat',
    label: 'Flat Design',
    prompt: 'flat vector art style, minimalist, clean lines, solid vibrant colors, simple shapes, professional illustration, behance style',
    icon: '🎨'
  },
  {
    name: '3D',
    label: '3D Character',
    prompt: '3D Pixar style character render, soft lighting, clay texture, cute, highly detailed, expressive face, volumetric, octane render',
    icon: '🧊'
  },
  {
    name: 'Anime',
    label: 'Anime',
    prompt: 'high quality anime style, makoto shinkai style, vibrant colors, detailed eyes, atmospheric lighting, beautiful composition',
    icon: '✨'
  },
  {
    name: 'Retro',
    label: 'Retro 80s',
    prompt: 'retro 80s synthwave style, neon lights, grain, vintage poster aesthetic, cyberpunk color palette, chrome effects',
    icon: '📼'
  },
  {
    name: 'Clay',
    label: 'Claymation',
    prompt: 'claymation style, aardman animation, plasticine texture, stop motion look, fingerprint textures, soft focus, whimsical',
    icon: '🧶'
  },
  {
    name: 'Pixel',
    label: 'Pixel Art',
    prompt: '16-bit pixel art style, SNES character sprite, limited color palette, dithering, retro game aesthetic, sharp edges',
    icon: '👾'
  },
  {
    name: 'Water',
    label: 'Watercolor',
    prompt: 'watercolor painting, soft brush strokes, artistic drips, paper texture, pastel colors, dreamy atmosphere, wet on wet',
    icon: '🖌️'
  },
  {
    name: 'Cyber',
    label: 'Cyberpunk',
    prompt: 'futuristic cyberpunk style, neon glowing circuitry, high tech, night city background, metallic texture, blue and pink lights',
    icon: '🦾'
  },
  {
    name: 'Pop',
    label: 'Pop Art',
    prompt: 'pop art style, roy lichtenstein, comic book dots, bold black outlines, primary colors, retro comic aesthetic, halftone pattern',
    icon: '💥'
  },
  {
    name: 'Sketch',
    label: 'Pencil Sketch',
    prompt: 'pencil sketch style, graphite texture, rough lines, artistic shading, sketchbook aesthetic, monochrome with splash of color',
    icon: '✏️'
  },
  {
    name: 'Paper',
    label: 'Paper Cutout',
    prompt: 'layered paper cutout art, paper craft style, depth of field, shadows, textured paper, vibrant colors, diorama look',
    icon: '✂️'
  },
  {
    name: 'Street',
    label: 'Graffiti',
    prompt: 'graffiti street art style, spray paint texture, bold urban vibe, vibrant splashes, wall texture, stencil art',
    icon: '🧢'
  }
];

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageAsset | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStyleNames, setSelectedStyleNames] = useState<string[]>(['Flat', '3D', 'Anime', 'Retro']);
  
  // Convert file to base64
  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSourceImage({
          data: e.target.result as string,
          mimeType: file.type
        });
        setGeneratedImages([]); // Reset previous generations
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!sourceImage || selectedStyleNames.length === 0) return;

    setIsGenerating(true);
    setGeneratedImages([]); 

    const activeStyles = STYLES.filter(s => selectedStyleNames.includes(s.name));

    // Create a promise for each selected style
    const promises = activeStyles.map(async (style) => {
      try {
        const url = await generateImageVariation(sourceImage, style.prompt);
        return {
          id: crypto.randomUUID(),
          url,
          styleName: style.label,
          promptUsed: style.prompt
        } as GeneratedImage;
      } catch (error) {
        console.error(`Failed to generate ${style.name}:`, error);
        return null;
      }
    });

    try {
      const results = await Promise.all(promises);
      const successfulResults = results.filter((r): r is GeneratedImage => r !== null);
      setGeneratedImages(successfulResults);
    } catch (error) {
      console.error("Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStyle = (styleName: string) => {
    if (isGenerating) return;
    
    setSelectedStyleNames(prev => {
      if (prev.includes(styleName)) {
        return prev.filter(n => n !== styleName);
      } else {
        // Allow up to 4 selections. If 4, remove the first one (FIFO) to add the new one
        if (prev.length >= 4) {
          return [...prev.slice(1), styleName];
        }
        return [...prev, styleName];
      }
    });
  };

  const handleEditClick = (image: GeneratedImage) => {
    setEditingImage(image);
    setIsEditModalOpen(true);
  };

  const handleSaveEdited = (newImage: GeneratedImage) => {
    setGeneratedImages(prev => [newImage, ...prev]);
  };

  const handleReplaceImage = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (generatedImages.length > 0) {
      const confirmReplace = window.confirm("Replace photo? This will clear your current generated avatars.");
      if (!confirmReplace) return;
    }
    setSourceImage(null);
    setGeneratedImages([]);
    // Keep styles selected for convenience
  };

  const resetApp = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (sourceImage && generatedImages.length > 0) {
       const confirmReset = window.confirm("Return to home? This will clear all your work.");
       if (!confirmReset) return;
    }
    setSourceImage(null);
    setGeneratedImages([]);
    setSelectedStyleNames(['Flat', '3D', 'Anime', 'Retro']); // Reset to defaults
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo Click - Soft Reset */}
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={resetApp}
              title="Return to Home"
            >
              {sourceImage ? (
                <div className="relative">
                  <img 
                    src={sourceImage.data} 
                    alt="My Avatar" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100 shadow-sm group-hover:border-indigo-300 transition-all" 
                  />
                  <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-1 border border-white">
                    <Sparkles className="w-2 h-2 text-white" />
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-600 p-2.5 rounded-xl group-hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  <Wand2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors leading-none">
                  MagicSelf <span className="text-indigo-600">AI</span>
                </span>
              </div>
            </div>

            {sourceImage && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={resetApp} 
                icon={<ArrowLeft className="w-4 h-4" />}
                title="Start Over"
              >
                Reset All
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!sourceImage ? (
          /* Upload State */
          <div className="max-w-3xl mx-auto mt-8 animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                MagicSelf <span className="text-indigo-600">AI</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-800 font-medium mb-6 italic leading-relaxed">
                Instantly “Change the Lens,”<br/> Define Infinite Versions of Yourself.
              </p>
              <p className="text-base text-gray-500 max-w-lg mx-auto">
                Upload a photo and let our AI transform it into 12 unique creative styles.
                Customize each result with simple text prompts.
              </p>
            </div>
            
            <ImageUploader onImageSelected={processFile} />
            
            {/* Style Preview Cards (Static) */}
            <div className="mt-16">
               <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Available Styles</p>
               <div className="grid grid-cols-3 md:grid-cols-6 gap-4 opacity-60 pointer-events-none grayscale hover:grayscale-0 transition-all">
                {STYLES.map((style) => (
                  <div key={style.name} className="bg-white p-3 rounded-xl border border-gray-200 text-center text-xs flex flex-col items-center justify-center h-24 shadow-sm">
                    <span className="text-2xl block mb-2">{style.icon}</span>
                    <span className="font-medium">{style.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Results State */
          <div className="animate-fade-in">
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              
              {/* Left Column: Source Image & Controls */}
              <div className="w-full lg:w-1/4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-24 z-10">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Original</h3>
                    <button 
                      onClick={handleReplaceImage}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      title="Remove and upload new photo"
                      aria-label="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4 shadow-inner relative group cursor-pointer" onClick={handleReplaceImage}>
                     <img 
                      src={sourceImage.data} 
                      alt="Original" 
                      className="w-full h-full object-cover"
                     />
                     {/* Overlay for Replace Action */}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                        <div className="bg-white/90 backdrop-blur-md border border-white/50 text-gray-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200">
                          <Trash2 className="w-4 h-4 text-red-500" />
                          Replace
                        </div>
                     </div>
                  </div>
                  
                  <div className="mb-4">
                     <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Instructions</h3>
                     <p className="text-xs text-gray-600 leading-relaxed">
                       1. Select up to 4 styles on the right.<br/>
                       2. Click Generate.<br/>
                       3. Click the "Edit" pencil on any result to refine it with text.
                     </p>
                  </div>

                  <Button 
                    onClick={handleGenerate} 
                    className="w-full" 
                    isLoading={isGenerating}
                    disabled={selectedStyleNames.length === 0}
                    icon={<Sparkles className="w-4 h-4" />}
                  >
                    {generatedImages.length > 0 ? 'Regenerate Selected' : 'Generate Styles'}
                  </Button>
                </div>
              </div>

              {/* Right Column: Style Selector & Grid */}
              <div className="w-full lg:w-3/4">
                {/* Style Selector */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                       <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">1</span>
                       Select Styles (Pick 4)
                    </h3>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                      {selectedStyleNames.length} / 4 Selected
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {STYLES.map((style) => {
                      const isSelected = selectedStyleNames.includes(style.name);
                      return (
                        <button
                          key={style.name}
                          onClick={() => toggleStyle(style.name)}
                          disabled={isGenerating}
                          className={`
                            relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 h-24
                            ${isSelected 
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-600 ring-offset-1' 
                              : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-100" />
                            </div>
                          )}
                          <span className="text-2xl mb-2 filter drop-shadow-sm">{style.icon}</span>
                          <span className="text-xs font-medium text-center leading-tight">{style.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Results Grid */}
                <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">2</span>
                        Results
                     </h3>
                   </div>

                  {generatedImages.length === 0 && !isGenerating && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center h-64 flex flex-col items-center justify-center">
                      <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                        <Sparkles className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-medium">Select styles above and click Generate to see magic.</p>
                    </div>
                  )}

                  {isGenerating && generatedImages.length === 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       {selectedStyleNames.map((name, i) => (
                         <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse flex flex-col items-center justify-center border border-gray-200">
                              <Sparkles className="w-8 h-8 text-gray-300 mb-3 animate-bounce" />
                              <span className="text-sm font-medium text-gray-400">Generating {name}...</span>
                         </div>
                       ))}
                     </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {generatedImages.map((image) => (
                      <ResultCard 
                        key={image.id} 
                        image={image} 
                        onEdit={handleEditClick}
                        onView={() => window.open(image.url, '_blank')}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <EditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        sourceImage={editingImage}
        onSave={handleSaveEdited}
      />
    </div>
  );
};

export default App;