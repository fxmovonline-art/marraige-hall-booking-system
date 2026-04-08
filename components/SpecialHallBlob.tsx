import React from "react";

// Replace this with the exact path from your design if available
const SPECIAL_BLOB_PATH =
  "M70,300 Q20,180 100,100 Q180,20 300,70 Q420,120 470,240 Q520,360 400,470 Q280,580 170,500 Q60,420 70,300 Z";

interface SpecialHallBlobProps {
  children: React.ReactNode;
  className?: string;
  backgroundImage?: string; // URL for drapes pattern
}

const SpecialHallBlob: React.FC<SpecialHallBlobProps> = ({
  children,
  className = "",
  backgroundImage,
}) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ aspectRatio: "1/1", maxWidth: 500, maxHeight: 500 }}>
      {/* Background Glow/Pattern */}
      <svg
        viewBox="0 0 540 600"
        className="absolute inset-0 w-full h-full z-0"
        style={{ filter: "blur(16px) brightness(1.2)", transition: "filter 0.3s" }}
      >
        <defs>
          {backgroundImage && (
            <pattern id="drapes" patternUnits="userSpaceOnUse" width="540" height="600">
              <image href={backgroundImage} x="0" y="0" width="540" height="600" />
            </pattern>
          )}
        </defs>
        <path
          d={SPECIAL_BLOB_PATH}
          fill={backgroundImage ? "url(#drapes)" : "#a21caf"}
          opacity="0.7"
        />
      </svg>
      {/* Main Content with Mask */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <clipPath id="special-hall-blob" clipPathUnits="userSpaceOnUse">
            <path d={SPECIAL_BLOB_PATH} />
          </clipPath>
        </defs>
      </svg>
      <div
        className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 bg-white/90"
        style={{
          clipPath: "url(#special-hall-blob)",
          WebkitClipPath: "url(#special-hall-blob)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      {/* Hover effect (shadow and glow, no scale) */}
      <style>{`
        .special-hall-blob:hover svg { filter: blur(32px) brightness(1.3); }
        .special-hall-blob:hover .z-10 { box-shadow: 0 8px 32px 0 rgba(162,28,175,0.25); }
      `}</style>
    </div>
  );
};

export default SpecialHallBlob;
