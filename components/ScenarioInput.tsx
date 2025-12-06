import React, { useState, useRef } from 'react';
import { Character } from '../types';

interface ScenarioInputProps {
  onAnalyze: (text: string, characters: Character[]) => void;
  isAnalyzing: boolean;
}

export const ScenarioInput: React.FC<ScenarioInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeCharId, setActiveCharId] = useState<string | null>(null);
  
  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddCharacter = () => {
    if (characters.length >= 5) return;
    const newChar: Character = {
      id: Date.now().toString(),
      name: '',
      imageBase64: ''
    };
    setCharacters([...characters, newChar]);
  };

  const handleRemoveCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  const handleNameChange = (id: string, newName: string) => {
    setCharacters(characters.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const triggerImageUpload = (id: string) => {
    setActiveCharId(id);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeCharId) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacters(characters.map(c => 
          c.id === activeCharId ? { ...c, imageBase64: reader.result as string } : c
        ));
        setActiveCharId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      // Filter out incomplete characters (need at least an image)
      const validCharacters = characters.filter(c => c.imageBase64);
      onAnalyze(text, validCharacters);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-white">1. Сценарий жазу</h2>
      <p className="text-gray-400 mb-4 text-sm">
        Фильм, жарнама немесе оқиға желісінің сценарийін осында жазыңыз.
        Кейіпкерлерді қосып, олардың фотосын жүктесеңіз, ЖИ оларды сценарийде қолданады.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          className="w-full h-40 bg-gray-950 text-white border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-primary-600 focus:outline-none transition-all resize-none"
          placeholder="Мысалы: Болашақтағы Алматы. Жас жігіт Арман ұшатын көлікпен тауға қарай бара жатыр. Оның қасында Әлия отыр..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isAnalyzing}
        />

        {/* Characters Section */}
        <div className="bg-gray-950 p-4 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-4">
             <label className="block text-sm font-medium text-gray-300">Кейіпкерлер ({characters.length}/5)</label>
             {characters.length < 5 && (
               <button
                 type="button"
                 onClick={handleAddCharacter}
                 disabled={isAnalyzing}
                 className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-primary-400 border border-gray-700 rounded transition-colors"
               >
                 + Кейіпкер қосу
               </button>
             )}
          </div>
           
           {/* Hidden File Input used by all rows */}
           <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />

           <div className="space-y-3">
             {characters.length === 0 && (
               <p className="text-xs text-gray-600 text-center italic py-2">
                 Кейіпкер фотоларын қосу міндетті емес, бірақ ұсынылады.
               </p>
             )}

             {characters.map((char) => (
               <div key={char.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-900 p-3 rounded border border-gray-700">
                 {/* Photo Upload */}
                 <div 
                   onClick={() => triggerImageUpload(char.id)}
                   className="relative w-12 h-12 flex-shrink-0 bg-gray-800 rounded overflow-hidden border border-gray-600 cursor-pointer hover:border-primary-500 transition-colors group"
                 >
                   {char.imageBase64 ? (
                     <img src={char.imageBase64} alt={char.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-500 group-hover:text-primary-400">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                     </div>
                   )}
                 </div>

                 {/* Name Input */}
                 <div className="flex-1 w-full">
                   <input
                     type="text"
                     placeholder="Есімі (мысалы: Арман)"
                     value={char.name}
                     onChange={(e) => handleNameChange(char.id, e.target.value)}
                     className="w-full bg-gray-800 text-white text-sm px-3 py-2 rounded border border-gray-700 focus:border-primary-500 focus:outline-none"
                   />
                 </div>

                 {/* Delete Button */}
                 <button
                   type="button"
                   onClick={() => handleRemoveCharacter(char.id)}
                   className="text-red-400 hover:text-red-300 p-2"
                   title="Өшіру"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 </button>
               </div>
             ))}
           </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={!text.trim() || isAnalyzing}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all
              ${!text.trim() || isAnalyzing 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 shadow-lg hover:shadow-primary-500/25'
              }`}
          >
            {isAnalyzing ? 'Талдау жүріп жатыр...' : 'Сценарийді Талдау және Суреттеу'}
          </button>
        </div>
      </form>
    </div>
  );
};