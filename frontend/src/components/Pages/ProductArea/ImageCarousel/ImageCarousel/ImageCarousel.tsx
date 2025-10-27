import React from "react";
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
  return (
    <div className="relative bg-gray-50 p-6 rounded-xl mb-4 overflow-hidden group">
      <div className="relative w-full h-40 flex items-center justify-center">
        <img
          src={productImages[currentImageIndex]}
          alt={title}
          className="w-full h-40 object-contain relative z-10 transition-all duration-500 ease-in-out transform drop-shadow-md"
        />

        {productImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            >
              ‹
            </button>

            <button
              onClick={nextImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            >
              ›
            </button>
          </>
        )}
      </div>

      {productImages.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
          {productImages.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all duration-300 ${
                index === currentImageIndex ? "bg-stockblue" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}

      {isEditing && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end justify-center pb-3 z-20 transition-all duration-300">
          <div className="flex gap-2 flex-wrap justify-center">
            {/* Replace */}
            <label
              htmlFor="replace-upload"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stockblue bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/30 cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-white transition-all duration-300"
            >
              <Upload size={14} />
              החלף
            </label>
            <input
              type="file"
              id="replace-upload"
              accept="image/*"
              onChange={handleReplaceImage}
              className="hidden"
            />

            {/* Add */}
            <label
              htmlFor="add-upload"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-green-600 bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/30 cursor-pointer hover:shadow-lg hover:scale-105 hover:bg-white transition-all duration-300"
            >
              <Upload size={14} />
              הוסף
            </label>
            <input
              type="file"
              id="add-upload"
              accept="image/*"
              multiple
              onChange={handleAddImages}
              className="hidden"
            />

            {/* Delete */}
            <button
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
