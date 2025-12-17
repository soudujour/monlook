
import { Accessory, AccessoryType } from '../types';
import { ACCESSORIES } from '../constants';

export interface ProductResult {
    products: Accessory[];
    isLive: boolean;
}

export const getProducts = async (): Promise<ProductResult> => {
  try {
    const DOMAIN = 'soudujour.com.br';
    const FEED_URL = `https://www.${DOMAIN}/xml-google-shopping`;
    
    // Verifica se o app está rodando dentro do site oficial (ou subdomínios)
    const isRunningOnOfficialSite = window.location.hostname.includes(DOMAIN);

    let finalUrl;

    if (isRunningOnOfficialSite) {
        // MODO PRODUÇÃO:
        // Se estiver no site oficial, acessa direto (mais rápido, seguro e sem depender de terceiros)
        // Adicionamos ?t=... para garantir que o navegador não entregue uma versão velha do XML (cache)
        finalUrl = `${FEED_URL}?t=${Date.now()}`;
        console.log("Ambiente Oficial detectado: Acessando catálogo diretamente.");
    } else {
        // MODO DESENVOLVIMENTO:
        // Se estiver em localhost ou outro servidor, usa o Proxy 'AllOrigins' 
        // Isso é necessário porque o navegador bloqueia pedidos entre sites diferentes (CORS)
        finalUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(FEED_URL)}&t=${Date.now()}`;
        console.log("Ambiente Externo detectado: Acessando catálogo via Proxy.");
    }

    const response = await fetch(finalUrl);

    if (!response.ok) {
      throw new Error('Falha ao conectar com a loja.');
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const items = xmlDoc.getElementsByTagName("item");
    
    if (items.length === 0) {
        throw new Error("XML recebido mas nenhum item encontrado.");
    }

    const products: Accessory[] = [];

    // Função robusta para encontrar conteúdo de tags, lidando com namespaces (g:image_link) e variações
    const getTagValue = (parent: Element, tagName: string): string | null => {
        // 1. Tenta tag direta (ex: title)
        let els = parent.getElementsByTagName(tagName);
        if (els.length > 0 && els[0].textContent) return els[0].textContent;

        // 2. Tenta com namespace 'g:' (ex: g:image_link)
        els = parent.getElementsByTagName("g:" + tagName);
        if (els.length > 0 && els[0].textContent) return els[0].textContent;

        // 3. Tenta varrer filhos manualmente (fallback para browsers estritos com namespace)
        for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            // Verifica se o nome da tag termina com o que procuramos (ignora o prefixo do namespace)
            if (child.tagName.endsWith(tagName) || child.nodeName.endsWith(tagName)) {
                return child.textContent;
            }
        }
        return null;
    };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const title = getTagValue(item, 'title');
      const imageUrl = getTagValue(item, 'image_link');

      if (title && imageUrl) {
        let type: AccessoryType | null = null;
        const nameLower = title.toLowerCase();

        // Categorização automática simples baseada em palavras-chave no nome do produto
        if (nameLower.includes('anel') || nameLower.includes('aliança')) type = AccessoryType.Ring;
        else if (nameLower.includes('brinco') || nameLower.includes('argola') || nameLower.includes('ear')) type = AccessoryType.Earring;
        else if (nameLower.includes('colar') || nameLower.includes('gravata') || nameLower.includes('escapulário') || nameLower.includes('pingente')) type = AccessoryType.Necklace;
        else if (nameLower.includes('choker') || nameLower.includes('gargantilha')) type = AccessoryType.Choker;
        else if (nameLower.includes('pulseira') || nameLower.includes('bracelete') || nameLower.includes('tornozeleira')) type = AccessoryType.Bracelet;

        if (type) {
          products.push({
            name: title,
            type: type,
            imageUrl: imageUrl
          });
        }
      }
    }

    if (products.length > 0) {
      console.log(`Sucesso: ${products.length} produtos carregados da loja.`);
      return { products: products, isLive: true };
    }
    
    throw new Error("Nenhum produto válido identificado no XML.");

  } catch (error) {
    console.warn('Falha na integração online. Usando catálogo offline.', error);
    return { products: ACCESSORIES, isLive: false };
  }
};
