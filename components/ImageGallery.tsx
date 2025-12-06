import React from 'react';
import { GeneratedImage } from '../types';

interface ImageGalleryProps {
  images: GeneratedImage[];
  styleDescription: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, styleDescription }) => {
  if (images.length === 0) return null;

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-white">2. Сценарий Көріністері</h2>
        {styleDescription && (
          <span className="mt-2 md:mt-0 px-3 py-1 bg-gray-800 rounded-full text-xs text-primary-400 border border-gray-700">
            Стиль: {styleDescription}
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((img, index) => (
          <div key={img.id} className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-950 aspect-video shadow-lg transition-all hover:shadow-primary-500/10">
            <img 
              src={img.url} 
              alt={img.prompt} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Text Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent p-4 pt-12 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-sm text-gray-200 line-clamp-2 mr-10">{img.prompt}</p>
            </div>
            
            {/* Download Button */}
            <a 
              href={img.url} 
              download={`scenario-scene-${index + 1}.png`}
              className="absolute top-3 right-3 p-2.5 bg-gray-900/70 hover:bg-primary-600 text-white rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 hover:border-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transform sm:translate-y-2 sm:group-hover:translate-y-0 z-10"
              title="Суретті жүктеу"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};