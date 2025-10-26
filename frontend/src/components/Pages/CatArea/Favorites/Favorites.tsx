import React, { useEffect, useState } from "react";
import { initialCameraData, type CameraProduct } from "../SingleCat/SingleCat";
import { Heart } from "lucide-react";
import { useUser } from "../../../../context/UserContext";
import { Categories as CategoriesData } from "../Categories/Categories";
import { initialCategories, type Category } from "../Categories/Categories";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";

//MISSING SUBCATS LOGIC HERE AFTER BACKEND EXISTS IT MAY BE ADDED

export const Favorites: React.FC = () => {
  const [cameras, setCameras] = useState<CameraProduct[]>(initialCameraData);
  const [categories] = useState<Category[]>(
    initialCategories.filter((cat: Category) => cat.favorite)
  );

  const favoriteCameras = cameras.filter((camera) => camera.favorite);

  useEffect(() => {
    window.scrollBy({ top: 10, behavior: "smooth" });
  }, []);

  const toggleFavorite = (id: number) => {
    setCameras((prev) =>
      prev.map((cam) =>
        cam.id === id ? { ...cam, favorite: !cam.favorite } : cam
      )
    );
  };

  if (favoriteCameras.length === 0 && categories.length === 0) {
    return (
      <p className="text-gray-600 text-center mt-40 text-lg">
        אין מועדפים כרגע.
      </p>
    );
  }

  return (
    <div className="pt-32">
      <h1 className="mr-4 text-right text-3xl font-bold mb-6 text-blue-950">
        מועדפים
      </h1>

      {categories.length > 0 && (
        <>
          <h2 className="mr-8 text-xl font-semibold text-slate-800 mb-4 text-right">
            קטגוריות מועדפות
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6 m-8">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="relative bg-white rounded-xl p-6 text-center shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg"
              >
                <Link to={"/single-cat"}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-[100px] h-[100px] object-contain mx-auto mb-3"
                  />
                </Link>
                <p className="font-semibold text-slate-800">{cat.name}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {favoriteCameras.length > 0 && (
        <>
          <h2 className="mr-8 text-xl font-semibold text-slate-800 mb-4 text-right">
            מוצרים מועדפים{" "}
          </h2>
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
                      camera.favorite
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }
                  />
                </button>
                <Link to={"/product"}>
                  <img
                    src={camera.imageUrl}
                    alt={camera.name}
                    className="w-[140px] h-[140px] object-contain rounded-lg mb-3 mx-auto"
                  />
                </Link>
                <span className="block text-base font-semibold text-slate-800 mb-1">
                  {camera.name}
                </span>
                <small className="block text-sm text-gray-500">
                  {camera.lens}
                </small>
                <small className="block text-sm text-gray-500">
                  {camera.color}
                </small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;
