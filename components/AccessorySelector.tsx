
import React, { useEffect, useState } from 'react';
import { Accessory, AccessoryType } from '../types';
import { getProducts } from '../services/productService';

interface AccessorySelectorProps {
  activeCategory: AccessoryType;
  onCategoryChange: (category: AccessoryType) => void;
  selectedAccessories: Accessory[];
  onToggleAccessory: (accessory: Accessory) => void;
  onSimulate: () => void;
  onClearSelection: () => void;
  isLoading: boolean;
}

// Cores baseadas na marca Du Jour (#7da1b0)
const BRAND_COLOR = "text-[#7da1b0]";
const BRAND_BG = "bg-[#7da1b0]";
const BRAND_BORDER = "border-[#7da1b0]";

const AccessoryCard: React.FC<{ 
    accessory: Accessory; 
    isSelected: boolean; 
    onToggle: () => void; 
}> = ({ accessory, isSelected, onToggle }) => (
    <div 
        className={`
            group relative flex flex-col bg-white rounded-lg shadow-sm transition-all duration-300 overflow-hidden cursor-pointer h-full
            ${isSelected ? `ring-2 ring-offset-1 ring-[#7da1b0] border-transparent` : 'border border-gray-100 hover:shadow-md'}
        `}
        onClick={onToggle}
    >
        {/* Indicador de Seleção */}
        <div className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${isSelected ? `${BRAND_BG} border-transparent` : 'bg-white border-gray-300'}`}>
            {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            )}
        </div>

        {/* Imagem do Produto */}
        <div className="relative aspect-square w-full bg-white overflow-hidden p-2">
            <img 
                src={accessory.imageUrl} 
                alt={accessory.name} 
                className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
            />
        </div>

        {/* Informações do Produto */}
        <div className={`p-3 flex flex-col flex-grow border-t ${isSelected ? 'bg-blue-50/30 border-blue-100' : 'border-gray-50'}`}>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">{accessory.type}</p>
            <h4 className={`text-xs font-medium leading-snug line-clamp-2 transition-colors ${isSelected ? 'text-[#7da1b0]' : 'text-gray-700'}`}>
                {accessory.name}
            </h4>
        </div>
    </div>
  );

const LoadingSkeleton = () => (
    <div className="flex flex-col bg-white rounded-lg border border-gray-100 p-3 animate-pulse">
        <div className="w-full aspect-square bg-gray-100 rounded mb-3"></div>
        <div className="h-3 bg-gray-100 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-100 rounded w-3/4"></div>
    </div>
);

export const AccessorySelector: React.FC<AccessorySelectorProps> = ({ 
    activeCategory, 
    onCategoryChange, 
    selectedAccessories,
    onToggleAccessory,
    onSimulate,
    onClearSelection,
    isLoading 
}) => {
  const categories = Object.values(AccessoryType);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isLiveCatalog, setIsLiveCatalog] = useState(false);

  // Busca os produtos ao carregar o componente
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
        setLoadingProducts(true);
        const result = await getProducts();
        if (isMounted) {
            setAccessories(result.products);
            setIsLiveCatalog(result.isLive);
            setLoadingProducts(false);
        }
    };
    fetchCatalog();
    return () => { isMounted = false; };
  }, []);

  const filteredAccessories = accessories.filter(acc => acc.type === activeCategory);
  const selectionCount = selectedAccessories.length;

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col h-full border border-gray-100 overflow-hidden relative">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
            <div className="flex flex-col">
                <h3 className={`font-serif text-lg ${BRAND_COLOR} tracking-wide font-bold`}>Montar Look</h3>
                <div className="flex items-center mt-1 space-x-2">
                    {/* Badge de Status */}
                    {loadingProducts ? (
                        <span className="text-[10px] text-gray-400">Carregando...</span>
                    ) : (
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${isLiveCatalog ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                            <span className={`w-1.5 h-1.5 mr-1 rounded-full ${isLiveCatalog ? 'bg-green-400' : 'bg-orange-400'}`}></span>
                            {isLiveCatalog ? 'Online' : 'Demo'}
                        </span>
                    )}
                </div>
            </div>
            {selectionCount > 0 && (
                <button 
                    onClick={onClearSelection} 
                    className="text-[10px] text-red-500 hover:text-red-700 underline font-medium"
                    disabled={isLoading}
                >
                    Limpar ({selectionCount})
                </button>
            )}
        </div>
        
        {/* Navegação de Categorias */}
        <div className="border-b border-gray-100 bg-white">
            <nav className="flex px-4 py-0 overflow-x-auto no-scrollbar mask-linear-fade" aria-label="Tabs">
                <div className="flex space-x-6 min-w-max pb-3 pt-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        disabled={isLoading || loadingProducts}
                        className={`
                            relative text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 pb-1
                            ${activeCategory === category 
                                ? 'text-gray-800' 
                                : 'text-gray-400 hover:text-gray-600'}
                        `}
                    >
                        {category}
                        {activeCategory === category && (
                            <span className={`absolute -bottom-3.5 left-0 w-full h-0.5 ${BRAND_BG}`}></span>
                        )}
                    </button>
                ))}
                </div>
            </nav>
        </div>

        {/* Grade de Produtos */}
        <div className="flex-grow overflow-y-auto p-4 bg-gray-50/50 custom-scrollbar pb-24"> {/* Extra padding for bottom button */}
            <div className="grid grid-cols-2 gap-3 pb-2">
                {loadingProducts ? (
                    Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} />)
                ) : (
                    filteredAccessories.map((accessory, index) => {
                        const isSelected = selectedAccessories.some(a => a.name === accessory.name);
                        return (
                            <AccessoryCard 
                                key={`${accessory.name}-${index}`} 
                                accessory={accessory} 
                                isSelected={isSelected}
                                onToggle={() => !isLoading && onToggleAccessory(accessory)} 
                            />
                        );
                    })
                )}
            </div>
            
            {!loadingProducts && filteredAccessories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 h-full">
                    <p className="text-sm">Nenhum item encontrado.</p>
                </div>
            )}
        </div>

         {/* Rodapé de Ação (Flutuante sobre a lista se necessário, ou fixo embaixo) */}
         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white/95 backdrop-blur shadow-lg">
            <button
              onClick={onSimulate}
              disabled={isLoading || selectionCount === 0}
              className={`
                w-full py-3 px-4 text-white font-bold text-xs rounded uppercase tracking-widest transition-all duration-300 shadow-md transform active:scale-[0.98]
                ${isLoading || selectionCount === 0 
                    ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                    : 'bg-gray-800 hover:bg-gray-900 hover:shadow-lg'}
              `}
            >
              {isLoading ? 'Criando Look...' : `Simular Look (${selectionCount})`}
            </button>
        </div>
    </div>
  );
};
