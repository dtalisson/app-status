/**
 * Normaliza URLs de imagem, especialmente URLs do Imgur
 * @param {string} imageUrl - URL da imagem a ser normalizada
 * @returns {string} - URL normalizada
 */
function normalizeImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') {
    return '';
  }

  let url = imageUrl.trim();

  // Se estiver vazio após trim, retornar vazio
  if (!url) {
    return '';
  }

  // Remover espaços e quebras de linha
  url = url.replace(/\s+/g, '').replace(/\n/g, '');

  // Se começar com /, é uma URL relativa (ex: /api/uploads/...) - retornar como está
  if (url.startsWith('/')) {
    return url;
  }

  // Se for URL do Imgur, normalizar
  if (url.includes('imgur.com')) {
    // Remover parâmetros de query e fragmentos
    url = url.split('?')[0].split('#')[0];

    // Se já está no formato https://i.imgur.com/ID.ext, retornar como está
    const alreadyCorrect = /^https?:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    if (alreadyCorrect) {
      // Garantir que seja https
      if (url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
      }
      return url;
    }

    // Extrair o ID do Imgur de diferentes formatos
    let imgurId = null;
    let ext = null;

    // Padrão 1: i.imgur.com/ID.ext (precisa normalizar para garantir extensão)
    const directMatch = url.match(/i\.imgur\.com\/([a-zA-Z0-9]+)(?:\.(jpg|jpeg|png|gif|webp))?/i);
    if (directMatch) {
      imgurId = directMatch[1];
      ext = directMatch[2] || 'jpg';
      url = `https://i.imgur.com/${imgurId}.${ext}`;
    } else {
      // Padrão 2: imgur.com/ID (sem extensão)
      const simpleMatch = url.match(/imgur\.com\/([a-zA-Z0-9]{5,})(?:\.(jpg|jpeg|png|gif|webp))?/i);
      if (simpleMatch) {
        imgurId = simpleMatch[1];
        ext = simpleMatch[2] || 'jpg';
        url = `https://i.imgur.com/${imgurId}.${ext}`;
      } else {
        // Padrão 3: imgur.com/a/ID ou imgur.com/gallery/ID
        const albumMatch = url.match(/imgur\.com\/(?:a|gallery)\/([a-zA-Z0-9]+)/);
        if (albumMatch) {
          // Para álbuns, usar o ID diretamente (pode funcionar em alguns casos)
          imgurId = albumMatch[1];
          url = `https://i.imgur.com/${imgurId}.jpg`;
        } else {
          // Padrão 4: tentar extrair qualquer ID
          const fallbackMatch = url.match(/imgur\.com\/([^\/\s?#\.]+)/);
          if (fallbackMatch && fallbackMatch[1].length >= 5) {
            imgurId = fallbackMatch[1].replace(/\.(jpg|jpeg|png|gif|webp)$/i, '');
            url = `https://i.imgur.com/${imgurId}.jpg`;
          }
        }
      }
    }

    // Se conseguiu extrair ID, garantir formato correto
    if (imgurId) {
      ext = ext || 'jpg';
      url = `https://i.imgur.com/${imgurId}.${ext}`;
    }

    // Garantir que começa com https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Garantir que não tenha i.imgur.com duplicado
    url = url.replace(/https?:\/\/(i\.)?i\.imgur\.com/, 'https://i.imgur.com');

  } else {
    // Para URLs não-Imgur, apenas garantir que começa com http/https
    // Mas não adicionar se já começar com /
    if (url && !url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      url = 'https://' + url;
    }
  }

  return url;
}

module.exports = { normalizeImageUrl };

