import { useState, useEffect } from 'react';
import { getImage, getCachedImageUrl } from '../../utils/imageStore';

interface AsyncImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallbackText?: string;
}

export function AsyncImage({ src, alt, className, fallbackText, ...props }: AsyncImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    if (!src) return '';
    return getCachedImageUrl(src) || '';
  });

  useEffect(() => {
    if (!src) {
      setResolvedSrc('');
      return;
    }

    const cached = getCachedImageUrl(src);
    if (cached) {
      setResolvedSrc(cached);
      return;
    }

    let isMounted = true;
    getImage(src).then((loaded) => {
      if (isMounted && loaded) {
        setResolvedSrc(loaded);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!resolvedSrc) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 text-zinc-600 text-xs ${className}`}>
        {fallbackText || 'Memuat...'}
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt || 'Foto'} className={className} {...props} />;
}
