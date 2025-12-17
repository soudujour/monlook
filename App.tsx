
import React, { useState, useCallback } from 'react';
import { Accessory, AccessoryType } from './types';
import { fileToBase64 } from './utils/imageUtils';
import { tryOnAccessory } from './services/geminiService';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { MainDisplay } from './components/MainDisplay';
import { AccessorySelector } from './components/AccessorySelector';

const App: React.FC = () => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [userImageBase64, setUserImageBase64] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<AccessoryType>(AccessoryType.Ring);
  
  // Estado para armazenar múltiplos acessórios selecionados
  const [selectedAccessories, setSelectedAccessories] = useState<Accessory[]>([]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);
      const base64 = await fileToBase64(file);
      const dataUrl = URL.createObjectURL(file);
      setUserImage(dataUrl);
      setUserImageBase64(base64);
      setGeneratedImage(null);
      setSelectedAccessories([]); // Reseta seleções ao mudar foto
    } catch (err) {
      setError('Falha ao carregar a imagem. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const handleToggleAccessory = useCallback((accessory: Accessory) => {
    setSelectedAccessories(prev => {
        const exists = prev.find(a => a.name === accessory.name);
        if (exists) {
            // Remove se já estiver selecionado
            return prev.filter(a => a.name !== accessory.name);
        } else {
            // Limite de segurança: máximo 4 itens para não confundir a IA
            if (prev.length >= 4) {
                setError("Selecione no máximo 4 itens por vez para melhor qualidade.");
                return prev;
            }
            setError(null);
            // Adiciona à lista
            return [...prev, accessory];
        }
    });
  }, []);

  const handleSimulateLook = async () => {
    if (!userImageBase64) {
      setError('Por favor, envie uma foto primeiro.');
      return;
    }
    
    if (selectedAccessories.length === 0) {
        setError('Selecione pelo menos um acessório.');
        return;
    }

    try {
      setIsLoading(true);
      setError(null);
      // Chama o serviço passando a lista completa
      const newImageBase64 = await tryOnAccessory(userImageBase64, selectedAccessories);
      setGeneratedImage(`data:image/png;base64,${newImageBase64}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    setSelectedAccessories([]);
    setGeneratedImage(null);
  };
  
  const handleNewPhoto = () => {
    setUserImage(null);
    setUserImageBase64(null);
    setGeneratedImage(null);
    setError(null);
    setSelectedAccessories([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col">
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md shadow-sm flex justify-between items-center" role="alert">
                <div>
                    <span className="font-bold mr-2">Atenção:</span>
                    <span>{error}</span>
                </div>
                <button onClick={() => setError(null)} className="text-red-700 font-bold ml-4">&times;</button>
            </div>
        )}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 flex flex-col min-h-[60vh] md:min-h-[70vh]">
              {userImage ? (
                <MainDisplay imageSrc={generatedImage || userImage} isLoading={isLoading} />
              ) : (
                <ImageUploader onImageUpload={handleImageUpload} />
              )}
            </div>
            <div className="lg:col-span-1 min-h-[50vh] lg:min-h-0">
               {userImage ? (
                 <AccessorySelector 
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    selectedAccessories={selectedAccessories}
                    onToggleAccessory={handleToggleAccessory}
                    onSimulate={handleSimulateLook}
                    onClearSelection={handleClearAll}
                    isLoading={isLoading}
                 />
               ) : (
                <div className="bg-white rounded-lg shadow-lg flex flex-col h-full items-center justify-center p-8 text-center border border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-gray-300 mb-4"><path d="m18 8-4 4 4 4"/><path d="m6 8 4 4-4 4"/></svg>
                    <h3 className="font-bold text-xl text-gray-700">Aguardando sua foto</h3>
                    <p className="text-gray-500 mt-2 text-sm">O catálogo será liberado após o envio da imagem.</p>
                </div>
               )}
            </div>
        </div>
        {userImage && (
             <div className="mt-6 text-center">
                <button
                    onClick={handleNewPhoto}
                    disabled={isLoading}
                    className="px-6 py-2 bg-white text-gray-600 border border-gray-300 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    Trocar Foto / Reiniciar
                </button>
            </div>
        )}
      </main>
    </div>
  );
};

export default App;
