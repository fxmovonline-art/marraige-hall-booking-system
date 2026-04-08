"use client";

import Image from "next/image";
import { useState } from "react";

interface HallImageProps {
  src: string;
  alt: string;
}

export function HallImage({ src, alt }: HallImageProps) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-200 text-xs font-medium text-zinc-500">
        Image not found
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
      onError={() => setError(true)}
    />
  );
}
