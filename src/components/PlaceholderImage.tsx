'use client';

import Image from 'next/image';
import { useState, useEffect, memo } from 'react';

interface PlaceholderImageProps {
  src: string;
  alt: string;
  emoji: string;
  bgColor?: string;
  priority?: boolean;
}

function PlaceholderImage({ src, alt, emoji, bgColor = 'bg-white', priority = false }: PlaceholderImageProps) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes (BUG-06)
  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${bgColor}`}>
        <span
          className="select-none"
          style={{ fontSize: 'clamp(100px, 22vw, 220px)', lineHeight: 1 }}
          role="img"
          aria-label={alt}
        >
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Padding wrapper — avoids p-6 on fill Image which conflicts with inset:0 */}
      <div className="absolute inset-5">
        <div className="relative w-full h-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 80vw, 55vw"
            className="object-contain"
            onError={() => setHasError(true)}
            priority={priority}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(PlaceholderImage);
