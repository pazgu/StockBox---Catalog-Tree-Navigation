import React, { useEffect, useRef, useCallback, useId } from "react";
import { Upload, ImageOff } from "lucide-react";
import { Spinner } from "../../../../../components/ui/spinner";


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
  isUploading?: boolean;

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
  isUploading = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const replaceId = useId();
  const addId = useId();

    const validImages = (productImages || []).filter(
    (u) => typeof u === "string" && u.trim().length > 0
  );

    const hasImages = validImages.length > 0;
  const shownIndex = Math.min(
    currentImageIndex,
    Math.max(0, validImages.length - 1)
  );
  const shownSrc = hasImages ? validImages[shownIndex] : "";

  useEffect(() => {
  if (currentImageIndex > validImages.length - 1) {
    setCurrentImageIndex(Math.max(0, validImages.length - 1));
  }
}, [validImages.length, currentImageIndex, setCurrentImageIndex]);


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

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const threshold = 40;
    if (delta > threshold) prevImage();
    if (delta < -threshold) nextImage();
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-gray-50 p-6 rounded-xl mb-4 overflow-hidden group"
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={`${title || "גלריה"} - גלריית תמונות`}
    >

       {isUploading && (
      <div className="absolute inset-0 z-50 grid place-items-center bg-white/60 backdrop-blur-sm">
        <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 shadow">
          <Spinner className="size-6 text-stockblue" />
          <span className="text-sm font-semibold text-stockblue">מעלה תמונות…</span>
        </div>
      </div>
    )}
      <div className="relative w-full h-40 flex items-center justify-center">
        {hasImages ? (
  <img
    src={shownSrc}
    alt={title || "תמונה"}
    className="w-full h-52 object-contain relative z-10 transition-all duration-500 ease-in-out transform drop-shadow-md"
    draggable={false}
    onError={(e) => {
      // if image breaks, hide it and show placeholder instead
      (e.currentTarget as HTMLImageElement).style.display = "none";
    }}
  />
) : (
  <div className="w-full h-40 relative z-10 flex flex-col items-center justify-center gap-2 text-slate-500">
    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm grid place-items-center border border-slate-200">
      <ImageOff className="h-7 w-7" />
    </div>
    <div className="text-sm font-semibold">אין תמונות עדיין</div>
    <div className="text-xs text-slate-400">PNG · JPG · JPEG</div>
  </div>
)}


        {validImages.length > 1 && (
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

      {hasImages && validImages.length > 1 && (
  <div className="flex justify-center gap-2 mt-2">
    {validImages.map((_, index) => (
      <button
        type="button"
        key={index}
        onClick={() => setCurrentImageIndex(index)}
        className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
          index === shownIndex ? "bg-stockblue" : "bg-gray-300"
        }`}
        aria-label={`בחר תמונה ${index + 1}`}
      />
    ))}
  </div>
)}


      {isEditing && (
  <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-3 z-20 transition-all duration-300">
    <div className={`pointer-events-auto flex gap-2 flex-wrap justify-center ${isUploading ? "opacity-60 pointer-events-none" : ""}`}>

      {!hasImages ? (
        <>
          <label
            htmlFor={addId}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#5A7863] bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/30 cursor-pointer hover:shadow-lg hover:bg-white"
          >
            <Upload size={14} />
            העלה תמונה
          </label>
          <input
            type="file"
            id={addId}
            accept="image/*"
            multiple
            onChange={handleAddImages}
            className="hidden"
          />
        </>
      ) : (
        <>
          <label
            htmlFor={replaceId}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stockblue bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/30 cursor-pointer hover:shadow-lg hover:bg-white"
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

          <label
            htmlFor={addId}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#5A7863] bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/30 cursor-pointer hover:shadow-lg hover:bg-white"
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

          <button
            type="button"
            onClick={handleDeleteImage}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#A91D3A] backdrop-blur-sm rounded-lg shadow-md border border-[#A91D3A] hover:shadow-lg hover:bg-[#A91D3A]/80"
          >
            מחיקה
          </button>
        </>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default ImageCarousel;
