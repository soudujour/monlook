
import { GoogleGenAI, Modality } from '@google/genai';
import { Accessory } from '../types';
import { urlToBase64 } from '../utils/imageUtils';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const tryOnAccessory = async (
  userImageBase64: string,
  accessories: Accessory[]
): Promise<string> => {
  try {
    const parts = [];

    // 1. Adiciona a imagem do usuário (base)
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: userImageBase64,
      },
    });

    // 2. Processa e adiciona cada acessório selecionado
    const accessoryDescriptions: string[] = [];
    
    for (const acc of accessories) {
        // Converte a URL do acessório para Base64
        const accBase64 = await urlToBase64(acc.imageUrl);
        
        parts.push({
            inlineData: {
                mimeType: 'image/jpeg',
                data: accBase64,
            }
        });
        
        accessoryDescriptions.push(`${acc.type} chamado "${acc.name}"`);
    }

    // 3. Monta o Prompt textual
    const promptText = `
      A primeira imagem é a foto do usuário. As imagens subsequentes são acessórios de moda.
      Sua tarefa é atuar como um provador virtual realista.
      
      Adicione TODOS os seguintes itens à pessoa na primeira imagem:
      ${accessoryDescriptions.map((desc, i) => `- Item ${i + 1}: ${desc}`).join('\n')}
      
      Regras:
      1. Posicione cada acessório em sua parte do corpo correta (anéis nos dedos, brincos nas orelhas, colares no pescoço, etc).
      2. Mantenha a iluminação, sombras e o tom de pele da foto original.
      3. A imagem final deve parecer uma fotografia real, não uma colagem.
      4. Se houver mais de um anel, distribua-os esteticamente.
    `;

    parts.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }

    throw new Error('Nenhuma imagem foi gerada na resposta.');
  } catch (error) {
    console.error('Erro ao chamar a API Gemini:', error);
    throw new Error('Não foi possível aplicar os acessórios. Por favor, tente novamente.');
  }
};
