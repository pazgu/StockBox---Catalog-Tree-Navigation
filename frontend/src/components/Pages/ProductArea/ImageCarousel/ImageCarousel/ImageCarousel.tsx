import React, { useEffect, useRef, useCallback, useId } from "react";
import { Upload } from "lucide-react";

interface ImageCarouselProps {
  productImages: string[];
  currentImageIndex: number;
  setCurrentImageIndex: (index: number) => void;
  prevImage: () => void;
  nextImage: () => void;
  isEditing?: boolean;
  handleReplaceImage?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddImages?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDeleteImage?: () => void;
  title?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  productImages,
  currentImageIndex,
  setCurrentImageIndex,
  prevImage,
  nextImage,
  isEditing = false,
  handleReplaceImage,
  handleAddImages,
  handleDeleteImage,
  title,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const replaceId = useId();
  const addId = useId();

  // Keep index valid if the list size changes
  useEffect(() => {
    if (currentImageIndex > productImages.length - 1) {
      setCurrentImageIndex(Math.max(0, productImages.length - 1));
    }
  }, [productImages.length, currentImageIndex, setCurrentImageIndex]);

  // Keyboard navigation (left/right)
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const within =
        containerRef.current &&
        (containerRef.current.contains(document.activeElement) ||
          document.activeElement === document.body);
      if (!within) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevImage();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nextImage();
      }
    },
    [prevImage, nextImage]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const threshold = 40; // px
    if (delta > threshold) prevImage();
    if (delta < -threshold) nextImage();
  };

  if (!productImages.length) return null;

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-50 p-6 rounded-xl mb-4 overflow-hidden group"
      tabIndex={0}               // focusable for keyboard navigation
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={`${title || "גלריה"} - גלריית תמונות`}
    >
      <div className="relative w-full h-40 flex items-center justify-center">
        <img
          src={productImages[currentImageIndex]}
          alt={title}
          className="w-full h-40 object-contain relative z-10 transition-all duration-500 ease-in-out transform drop-shadow-md"
          draggable={false}
        />

        {productImages.length > 1 && (
          <>
            {/* Prev on the LEFT */}
            <button
              type="button"
              onClick={prevImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-30"
              aria-label="תמונה קודמת"
            >
              ‹
            </button>

            {/* Next on the RIGHT */}
            <button
              type="button"
              onClick={nextImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-30"
              aria-label="תמונה הבאה"
            >
              ›
            </button>
          </>
        )}
      </div>

      {productImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {productImages.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentImageIndex ? "bg-stockblue" : "bg-gray-300"
              }`}
              aria-label={`בחר תמונה ${index + 1}`}
            />
          ))}
        </div>
      )}

      {isEditing && (
        // IMPORTANT: overlay no longer blocks clicks (pointer-events-none)
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-3 z-20 transition-all duration-300">
          <div className="pointer-events-auto flex gap-2 flex-wrap justify-center">
            {/* Replace */}
            <label
              htmlFor={replaceId}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stockblue bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/30 cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-white transition-all duration-300"
            >
              <Upload size={14} />
              החלף
            </label>
            <input
              type="file"
              id={replaceId}
              accept="image/*"
              onChange={handleReplaceImage}
              className="hidden"
            />

            {/* Add */}
            <label
              htmlFor={addId}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/30 cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-white transition-all duration-300"
            >
              <Upload size={14} />
              הוסף
            </label>
            <input
              type="file"
              id={addId}
              accept="image/*"
              multiple
              onChange={handleAddImages}
              className="hidden"
            />

            {/* Delete */}
            <button
              type="button"
              onClick={handleDeleteImage}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600/95 backdrop-blur-sm rounded-lg shadow-md border border-red-600/30 hover:shadow-lg hover:scale-105 hover:bg-red-700 transition-all duration-300"
            >
              מחק
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
