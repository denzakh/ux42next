import type { ImageLoaderProps } from 'next/image';

const assetDomain = 'https://assets.ux42.studio';

export default function cloudflareLoader({
    src,
    width,
    quality,
}: ImageLoaderProps) {
    // Если мы в режиме разработки (npm run dev на Windows),
    // отдаем оригинал без проксирования через Cloudflare
    if (process.env.NODE_ENV === 'development') {
        return src;
    }

    if (src.endsWith('.svg')) {
        return src;
    }

    // Если картинка уже маленькая (например, иконка), отдаем оригинал
    if (width < 50) {
        return src;
    }

    // Формируем параметры оптимизации
    const params = [`width=${width}`, 'format=auto'];
    if (quality) {
        params.push(`quality=${quality}`);
    } else {
        params.push('quality=75');
    }

    const paramsString = params.join(',');

    // Если это локальная статика из /public
    if (src.startsWith('/')) {
        return `/cdn-cgi/image/${paramsString}${src}`;
    }

    // Если это картинка из R2 (внешний URL)
    // Мы проксируем её через Cloudflare Images для сжатия
    if (src.startsWith(assetDomain)) {
        // Убираем домен, оставляя только путь внутри бакета
        const relativePath = src.replace(assetDomain, '');
        return `/cdn-cgi/image/${paramsString}${relativePath}`;
    }

    // 3. Для всего остального возвращаем как есть
    return src;
}
