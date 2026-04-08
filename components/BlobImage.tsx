import React from "react";

interface BlobImageProps {
  src: string;
  alt: string;
  className?: string;
}

const BlobImage: React.FC<BlobImageProps> = ({ src, alt, className = "" }) => {
  return (
    <div className={`relative group w-48 h-48 md:w-64 md:h-64 ${className}`} style={{ aspectRatio: 1 }}>
      {/* SVG for border */}
      <svg
        viewBox="0 0 1 1"
        width="100%"
        height="100%"
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ display: "block" }}
        preserveAspectRatio="none"
      >
        <path
          d="M0.85,0.15 C0.95,0.35 1,0.6 0.9,0.8 C0.75,1 0.45,1 0.2,0.9 C0.05,0.8 -0.05,0.5 0.05,0.25 C0.15,0.05 0.5,-0.05 0.85,0.15"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.04}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* SVG Definitions for the organic blob mask */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="organic-blob" clipPathUnits="objectBoundingBox">
            <path d="M0.85,0.15 C0.95,0.35 1,0.6 0.9,0.8 C0.75,1 0.45,1 0.2,0.9 C0.05,0.8 -0.05,0.5 0.05,0.25 C0.15,0.05 0.5,-0.05 0.85,0.15"></path>
          </clipPath>
        </defs>
      </svg>
      {/* Main image */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 z-0"
        style={{ clipPath: "url(#organic-blob)" }}
        draggable={false}
      />
    </div>
  );
};

export default BlobImage;
