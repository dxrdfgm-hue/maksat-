import React, { useState, useRef } from 'react';
import { Loader } from './Loader';

interface PhotoTransformerProps {
  styleDescription: string;
  onTransform: (file: File) => Promise<void>;
  isProcessing: boolean;
  resultImage: string | null;
}

export const PhotoTransformer: React.FC<PhotoTransformerProps> = ({ 
  styleDescription, 
  onTransform, 
  isProcessing,
  resultImage
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransformClick = () => {
    if (selectedFile) {
      onTransform(selectedFile);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl h-full">
      <h2 className="text-2xl font-bold mb-4 text-white">3. Өз фотоңызды өңдеу</h2>
      <p className="text-gray-400 mb-6 text-sm">
        Өз суретіңізді жүктеңіз, біз оны жоғарыдағы сценарий стиліне ({styleDescription || 'анықталмаған'}) бейімдеп береміз.
      </p>

      {!styleDescription ? (
        <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg text-yellow-200 text-sm">
          Алдымен сценарий жазып, талдау жасаңыз.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-700 hover:border-primary-500 rounded-lg p-6 text-center cursor-pointer transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            {previewUrl ? (
              <div className="relative h-48 w-full">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded">
                  <span className="text-white font-medium">Өзгерту</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <svg className="w-12 h-12 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-gray-400">Фото таңдау үшін басыңыз</span>
              </div>
            )}
          </div>

          <button
            onClick={handleTransformClick}
            disabled={!selectedFile || isProcessing}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-all
              ${!selectedFile || isProcessing
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-500 shadow-lg'
              }`}
          >
            {isProcessing ? 'Өңделуде...' : 'Сценарий стилінде өңдеу'}
          </button>

          {/* Result Area */}
          {isProcessing ? (
             <Loader message="Жасанды интеллект жұмыс істеуде..." />
          ) : resultImage && (
            <div className="mt-6 animate-fade-in">
              <h3 className="text-lg font-semibold mb-2 text-green-400">Нәтиже:</h3>
              <div className="rounded-lg overflow-hidden border border-green-500/30 shadow-lg shadow-green-900/20">
                <img src={resultImage} alt="Transformed" className="w-full h-auto" />
              </div>
              <a 
                href={resultImage} 
                download="kinogen-result.png"
                className="block mt-3 text-center text-sm text-primary-400 hover:text-primary-300 underline"
              >
                Суретті жүктеу
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};