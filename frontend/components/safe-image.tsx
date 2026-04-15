"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK_SRC = "/anime-poster-placeholder.svg";

function buildSafeSource(src: string | null | undefined, fallbackSrc: string): string {
  if (!src) {
    return fallbackSrc;
  }

  if (src.startsWith("/") || src.startsWith("data:")) {
    return src;
  }

  return `/api/image?url=${encodeURIComponent(src)}`;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  unoptimized,
  ...props
}: SafeImageProps) {
  const safeSource = buildSafeSource(src, fallbackSrc);
  const [currentSource, setCurrentSource] = useState(safeSource);

  useEffect(() => {
    setCurrentSource(safeSource);
  }, [safeSource]);

  return (
    <Image
      {...props}
      alt={alt}
      src={currentSource}
      unoptimized={currentSource === fallbackSrc ? true : unoptimized}
      onError={() => {
        if (currentSource !== fallbackSrc) {
          setCurrentSource(fallbackSrc);
        }
      }}
    />
  );
}
