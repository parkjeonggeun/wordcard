'use client';

import Image from 'next/image';
import { useState, memo } from 'react';

interface PlaceholderImageProps {
  src: string;
  alt: string;
  emoji: string;
  bgColor?: string;
  priority?: boolean;
}

function PlaceholderImage({ src, alt, emoji, bgColor = 'bg-white', priority = false }: PlaceholderImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${bgColor} rounded-3xl`}>
        <span
          className="select-none"
          style={{ fontSize: 'clamp(100px, 25vw, 240px)', lineHeight: 1 }}
          role="img"
          aria-label={alt}
        >
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${bgColor} rounded-3xl overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 90vw, 60vw"
        className="object-contain p-6"
        onError={() => setHasError(true)}
        priority={priority}
      />
    </div>
  );
}

export default memo(PlaceholderImage);
