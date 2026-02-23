"use client";
import { useState, useEffect, useRef, useMemo } from "react";

export default function ImagePreviewHover({ images, alt, className = "" }) {
  const safeImages = useMemo(() => {
    if (Array.isArray(images)) return images;
    if (images) return [images];
    return [];
  }, [images]);

  const [hovered, setHovered] = useState(false);
  const [idx, setIdx] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (hovered && safeImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setIdx((prev) => (prev + 1) % safeImages.length);
      }, 1200);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [hovered, safeImages.length]);

  const reset = () => {
    setHovered(false);
    setIdx(0);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  if (safeImages.length === 0) return null;

  return (
    <div
      className={`relative overflow-hidden w-40 h-40${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={reset}
    >
      {safeImages.map((src, i) => (
  <img
    key={i}
    src={src}
    alt={`${alt} ${i + 1}`}
    className="absolute inset-0 w-full h-full object-contain" 
    style={{
      opacity: i === idx ? 1 : 0,
      transition: "opacity 0.4s ease",
      pointerEvents: "none",
    }}
    draggable={false}
  />
))}

      {safeImages.length > 1 && (
        <div
          className="absolute left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none z-10"
          style={{
            bottom: 6,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        >
          {safeImages.map((_, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                height: 6,
                width: i === idx ? 18 : 6,
                background: i === idx ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.45)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}