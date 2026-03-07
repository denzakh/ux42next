import type { ImageLoaderProps } from 'next/image';

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

    // Формируем параметры оптимизации
    const params = [`width=${width}`, 'format=auto'];
    if (quality) {
        params.push(`quality=${quality}`);
    }

    const paramsString = params.join(',');

    // 1. Если это локальная статика из /public
    if (src.startsWith('/')) {
        return `/cdn-cgi/image/${paramsString}${src}`;
    }

    // 2. Если это картинка из R2 (внешний URL)
    // Мы проксируем её через Cloudflare Images для сжатия
    if (src.startsWith('https://assets.yourdomain.com')) {
        // Убираем домен, оставляя только путь внутри бакета
        const relativePath = src.replace('https://assets.yourdomain.com', '');
        return `/cdn-cgi/image/${paramsString}${relativePath}`;
    }

    // 3. Для всего остального возвращаем как есть
    return src;
}
