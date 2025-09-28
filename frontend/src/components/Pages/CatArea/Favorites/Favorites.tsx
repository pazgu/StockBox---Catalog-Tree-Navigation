import React from "react";
import { initialCameraData, type CameraProduct } from "../SingleCat/SingleCat";

export const Favorites: React.FC = () => {
  const favoriteCameras = initialCameraData.filter(
    (camera: CameraProduct) => camera.favorite
  );

  if (favoriteCameras.length === 0) {
    return <p className="text-gray-600">No favorite cameras yet.</p>;
  }

  return (
    <div className="pt-40">
      <h1 className="mr-4 w-full text-right text-3xl font-bold mb-6 text-blue-950">
        מועדפים
      </h1>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8 m-8">
        {favoriteCameras.map((camera: CameraProduct) => (
          <div
            key={camera.id}
            className="bg-white rounded-xl p-8 text-center shadow-lg transition-all duration-200 ease-out hover:transform hover:-translate-y-1 hover:shadow-xl m-4"
          >
            <img
              src={camera.imageUrl}
              alt={camera.name}
              className="w-[140px] h-[140px] object-contain rounded-lg mb-3 mx-auto"
            />
            <span className="block text-base font-semibold text-slate-800 mb-1">
              {camera.name}
            </span>
            <small className="block text-sm text-gray-500">{camera.lens}</small>
            <br/>
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
