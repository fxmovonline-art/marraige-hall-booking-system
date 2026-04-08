import React from 'react';

// Blob Component that can display an image or custom content
type BlobType = 'default' | 'complex';
interface OrganicShapeMaskProps {
  src?: string;
  content?: React.ReactNode;
  blobType?: BlobType;
  bgVariant?: string;
  customSize?: string;
  className?: string;
}

const OrganicShapeMask = ({
  src,
  content,
  blobType = 'default',
  bgVariant = 'light',
  customSize = 'w-72 h-72',
  className = '',
}: OrganicShapeMaskProps) => {
  // SVG clip paths for different organic shapes (you can add more complex paths here)
  const clipPaths: Record<BlobType, string> = {
    default: "url(#blob-shape-1)",
    complex: "url(#blob-shape-2)",
  };

  // Base and specific class names
  const shapeClasses = `${customSize} organic-mask shadow-xl object-cover transition-all duration-700 ease-in-out`;
  const bgClasses = `${customSize} organic-shape-bg shadow-xl object-cover transition-all duration-700 ease-in-out`;

  const containerClasses = `relative ${customSize} group ${className}`;
  
  // Conditionally rendering based on src and content
  const contentElement = src ? (
    <img
      src={src}
      className={shapeClasses}
      style={{ clipPath: clipPaths[blobType] }} // Inline style for dynamic clipPath
    />
  ) : (
    <div className={shapeClasses} style={{ clipPath: clipPaths[blobType] }}>
      {content}
    </div>
  );

  return (
    <div className={containerClasses}>
      {/* Dynamic Background Organic Shape (with optional gradient) */}
      <div className={bgClasses}></div>

      {/* Main Content with Blob Shape */}
      {contentElement}
      
      {/* Adding a dynamic glow effect to enhance the design on hover */}
      <div className="absolute inset-0 bg-blue-500 opacity-20 blur-xl animate-pulse group-hover:opacity-40 transition-opacity duration-500"></div>

      {/* Add specific organic shapes in an SVG definitions block to use in css */}
      <svg style={{ visibility: 'hidden', position: 'absolute' }} width="0" height="0">
        <defs>
          <clipPath id="blob-shape-1" clipPathUnits="objectBoundingBox">
            <path d="M0.8,0.2 C0.9,0.4 1,0.6 0.9,0.8 C0.7,1 0.4,1 0.2,0.9 C0,0.8 0,0.5 0.1,0.3 C0.2,0.1 0.5,0 0.8,0.2"></path>
          </clipPath>
          <clipPath id="blob-shape-2" clipPathUnits="objectBoundingBox">
            <path d="M1,0.5 C1,0.8 0.7,1 0.5,1 C0.3,1 0,0.8 0,0.5 C0,0.3 0.3,0 0.5,0 C0.7,0 1,0.3 1,0.5 Z" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

export default OrganicShapeMask;
