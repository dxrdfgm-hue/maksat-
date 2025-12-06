import React, { useState } from 'react';
import { ScenarioInput } from './components/ScenarioInput';
import { ImageGallery } from './components/ImageGallery';
import { PhotoTransformer } from './components/PhotoTransformer';
import { Loader } from './components/Loader';
import { GeneratedImage, AppStatus, Character } from './types';
import { analyzeScenario, generateImageFromPrompt, editUserImage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [styleDescription, setStyleDescription] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Track progress
  const [progress, setProgress] = useState<{current: number, total: number} | null>(null);

  const handleAnalyzeScenario = async (text: string, characters: Character[]) => {
    setStatus(AppStatus.ANALYZING);
    setErrorMsg(null);
    setGeneratedImages([]);
    setTransformedImage(null);
    setProgress(null);

    try {
      // 1. Analyze Text to get scenes and style
      const analysis = await analyzeScenario(text);
      setStyleDescription(analysis.style);

      setStatus(AppStatus.GENERATING_IMAGES);
      const totalScenes = analysis.scenes.length;
      setProgress({ current: 0, total: totalScenes });

      // 2. Generate images sequentially to avoid Rate Limits (429 errors)
      // and update UI incrementally
      for (const [index, scene] of analysis.scenes.entries()) {
        try {
          const fullPrompt = `${analysis.style} style. ${scene.visualDescription}`;
          
          // Generate image
          const imageUrl = await generateImageFromPrompt(fullPrompt, characters);
          
          const newImage: GeneratedImage = {
            id: `gen-${index}-${Date.now()}`,
            url: imageUrl,
            prompt: scene.title
          };

          // Add to state immediately so user sees it appear
          setGeneratedImages(prev => [...prev, newImage]);

          // Add a small delay between requests to be gentle on the API Rate Limits
          await new Promise(resolve => setTimeout(resolve, 1500));
          
        } catch (sceneError) {
          console.error(`Failed to generate scene ${index + 1}:`, sceneError);
          // Optional: You could add a placeholder for failed images here
        } finally {
          setProgress(prev => prev ? { ...prev, current: prev.current + 1 } : null);
        }
      }

      setStatus(AppStatus.IDLE);
      setProgress(null);

    } catch (err) {
      console.error(err);
      setErrorMsg("Қате орын алды. Қайта көріңіз немесе кейінірек талпыныңыз (API Rate Limit).");
      setStatus(AppStatus.ERROR);
      setProgress(null);
    }
  };

  const handleTransformUserPhoto = async (file: File) => {
    setStatus(AppStatus.EDITING_IMAGE);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        try {
          const result = await editUserImage(base64, styleDescription);
          setTransformedImage(result);
          setStatus(AppStatus.IDLE);
        } catch (err) {
          console.error(err);
          setErrorMsg("Фотоны өңдеу кезінде қате шықты.");
          setStatus(AppStatus.IDLE);
        }
      };
      
      reader.onerror = () => {
        setErrorMsg("Файлды оқу мүмкін емес.");
        setStatus(AppStatus.IDLE);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg("Белгісіз қате.");
      setStatus(AppStatus.IDLE);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-2">
          KinoGen AI
        </h1>
        <p className="text-gray-400 text-lg">
          Сценарийіңізді жазыңыз — біз оны киноға айналдырамыз
        </p>
      </header>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scenario Input & Gallery */}
        <div className="lg:col-span-2 space-y-8">
          <ScenarioInput 
            onAnalyze={handleAnalyzeScenario} 
            isAnalyzing={status === AppStatus.ANALYZING || status === AppStatus.GENERATING_IMAGES} 
          />
          
          {status === AppStatus.ANALYZING && (
            <Loader message="Сценарий талдануда..." />
          )}
          
          {status === AppStatus.GENERATING_IMAGES && (
            <div className="space-y-2">
               <Loader message={`Көріністер генерациялануда... (${progress?.current || 0}/${progress?.total || 0})`} />
               {/* Progress Bar */}
               {progress && progress.total > 0 && (
                 <div className="w-full bg-gray-800 rounded-full h-2.5">
                   <div 
                     className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                     style={{ width: `${(progress.current / progress.total) * 100}%` }}
                   ></div>
                 </div>
               )}
            </div>
          )}

          <ImageGallery images={generatedImages} styleDescription={styleDescription} />
        </div>

        {/* Right Column: User Photo Transformer */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <PhotoTransformer 
              styleDescription={styleDescription}
              onTransform={handleTransformUserPhoto}
              isProcessing={status === AppStatus.EDITING_IMAGE}
              resultImage={transformedImage}
            />
          </div>
        </div>
      </div>

      {/* Error Toast */}
      {errorMsg && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center animate-bounce z-50">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default App;