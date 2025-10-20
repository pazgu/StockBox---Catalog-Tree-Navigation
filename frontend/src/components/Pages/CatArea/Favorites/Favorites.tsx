import React, { useEffect, useState } from "react";
import { initialCameraData, type CameraProduct } from "../SingleCat/SingleCat";
import { Heart } from "lucide-react";

export const Favorites: React.FC = () => {
  const [cameras, setCameras] = useState<CameraProduct[]>(initialCameraData);

  const favoriteCameras = cameras.filter((camera) => camera.favorite);
  useEffect(() => {
    window.scrollBy({
      top: 10, // scroll down 100px
      behavior: "smooth",
    });
  }, []);

  const toggleFavorite = (id: number) => {
    setCameras((prev) =>
      prev.map((cam) =>
        cam.id === id ? { ...cam, favorite: !cam.favorite } : cam
      )
    );
  };

  if (favoriteCameras.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-40 text-lg">
        אין מצלמות מועדפות כרגע.
      </p>
    );
  }

  return (
    <div className="pt-32">
      <h1 className="mr-4 text-right text-3xl font-bold mb-6 text-blue-950">
        מועדפים
      </h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(273px,1fr))] gap-8 m-8">
        {favoriteCameras.map((camera) => (
          <div
            key={camera.id}
            className="relative bg-white rounded-xl p-8 text-center shadow-lg transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-xl"
          >
            <button
              onClick={() => toggleFavorite(camera.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            >
              <Heart
                size={22}
                strokeWidth={2}
                className={
                  camera.favorite ? "fill-red-500 text-red-500" : "text-white"
                }
              />
            </button>
            <a href="/product">
              <img
                src={camera.imageUrl}
                alt={camera.name}
                className="w-[140px] h-[140px] object-contain rounded-lg mb-3 mx-auto"
              />
            </a>
            <span className="block text-base font-semibold text-slate-800 mb-1">
              {camera.name}
            </span>
            <small className="block yhtext-sm text-gray-500">{camera.lens}</small>
            <small className="block text-sm text-gray-500">
              {camera.color}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
